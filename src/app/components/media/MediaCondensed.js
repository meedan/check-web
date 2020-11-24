import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import CardHeader from '@material-ui/core/CardHeader';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import IconMoreVert from '@material-ui/icons/MoreVert';
import { can } from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import TimeBefore from '../TimeBefore';
import MediaTypeDisplayName from './MediaTypeDisplayName';
import MediaRoute from '../../relay/MediaRoute';
import CheckContext from '../../CheckContext';
import DeleteRelationshipMutation from '../../relay/mutations/DeleteRelationshipMutation';
import UpdateRelationshipMutation from '../../relay/mutations/UpdateRelationshipMutation';
import {
  getCurrentProjectId,
  isBotInstalled,
  parseStringUnixTimestamp,
  truncateLength,
} from '../../helpers';
import { stringHelper } from '../../customHelpers';
import { black87 } from '../../styles/js/shared';

class MediaCondensedComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      broken: false,
    };
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleBreakRelationship() {
    const onFailure = () => {
      const message = (
        <FormattedMessage
          id="mediaCondensed.breakRelationshipError"
          defaultMessage="Sorry, an error occurred while breaking the relationship. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );
      this.props.setFlashMessage(message);
      this.setState({ broken: false });
    };

    const { id, source, target } = this.props.media.relationship;

    Relay.Store.commitUpdate(
      new DeleteRelationshipMutation({
        id,
        source,
        target,
        media: Object.assign(this.props.cachedMedia, this.props.media),
        current: this.props.currentRelatedMedia,
      }),
      { onFailure },
    );

    this.setState({ broken: true, anchorEl: null });
  }

  handlePromoteRelationship() {
    const { id, source, target } = this.props.media.relationship;

    const onFailure = () => {
      const message = (
        <FormattedMessage
          id="mediaCondensed.updateRelationshipError"
          defaultMessage="Sorry, an error occurred while updating the relationship. Please try again and contact {supportEmail} if the condition persists."
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );
      this.props.setFlashMessage(message);
    };

    const onSuccess = () => {
      if (/(\/project\/[0-9]+)?\/media\/[0-9]+$/.test(window.location.pathname)) {
        const currentMediaId = window.location.pathname.match(/[0-9]+$/)[0];
        if (target.dbid !== parseInt(currentMediaId, 10)) {
          window.location = window.location.href.replace(/[0-9]+$/, `${target.dbid}?reload=true`);
        }
      }
    };

    Relay.Store.commitUpdate(
      new UpdateRelationshipMutation({
        id,
        source,
        target,
        media: Object.assign(this.props.cachedMedia, this.props.media),
        current: this.props.currentRelatedMedia || this.props.media,
      }),
      { onFailure, onSuccess },
    );

    this.setState({ anchorEl: null });
  }

  handleOpenMenu = (e) => {
    this.setState({ anchorEl: e.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    if (this.state.broken) {
      return null;
    }

    const cachedMedia = this.props.cachedMedia || {};
    const media = Object.assign(cachedMedia, this.props.media);
    const { mediaUrl } = this.props;

    return (
      <div style={{ display: 'flex', position: 'relative' }}>
        <CardHeader
          title={
            <Link to={mediaUrl} className="media-condensed__title">
              <span style={{ color: black87 }}>
                {truncateLength(media.title, 90)}
              </span>
            </Link>}
          subheader={
            <p>
              <Link to={mediaUrl}>
                <span><MediaTypeDisplayName mediaType={media.type} /></span>
                { isBotInstalled(media.team, 'smooch') ?
                  <span>
                    <span style={{ margin: '0 8px' }}> - </span>
                    <span>
                      <FormattedMessage
                        id="mediaCondensed.requests"
                        defaultMessage="{count} requests"
                        values={{
                          count: media.requests_count,
                        }}
                      />
                    </span>
                  </span> : null
                }
                <span style={{ margin: '0 8px' }}> - </span>
                <TimeBefore date={parseStringUnixTimestamp(media.last_seen)} />
              </Link>
            </p>
          }
          avatar={
            <Link to={mediaUrl}>
              <img
                alt=""
                style={{ height: '100px', width: '100px', objectFit: 'cover' }}
                src={media.picture}
              />
            </Link>
          }
          style={{
            cursor: 'pointer',
            padding: 0,
            height: 100,
            width: '100%',
          }}
        />
        { !media.archived ?
          <div>
            <IconButton
              tooltip={
                <FormattedMessage id="mediaCondensed.tooltip" defaultMessage="Item actions" />
              }
              onClick={this.handleOpenMenu}
            >
              <IconMoreVert className="media-condensed__actions_icon" />
            </IconButton>
            <Menu
              anchorEl={this.state.anchorEl}
              keepMounted
              open={Boolean(this.state.anchorEl)}
              onClose={this.handleCloseMenu}
            >
              {(media.relationships && media.relationships.sources_count > 0 && can(media.relationship.permissions, 'update Relationship')) ? (
                <MenuItem key="promote" className="media-condensed__promote-relationshp" onClick={this.handlePromoteRelationship.bind(this)}>
                  <ListItemText
                    primary={
                      <FormattedMessage id="mediaCondensed.promote" defaultMessage="Promote to primary item" />
                    }
                  />
                </MenuItem>
              ) : null}
              {(media.relationships && media.relationships.sources_count > 0 && can(media.relationship.permissions, 'destroy Relationship')) ? (
                <MenuItem key="break" className="media-condensed__break-relationship" onClick={this.handleBreakRelationship.bind(this)} >
                  <ListItemText
                    primary={
                      <FormattedMessage id="mediaCondensed.break" defaultMessage="Break relation to primary item" />
                    }
                  />
                </MenuItem>
              ) : null}
            </Menu>
          </div> : null }
      </div>
    );
  }
}

MediaCondensedComponent.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

MediaCondensedComponent.contextTypes = {
  store: PropTypes.object,
};

const ConnectedMediaCondensedComponent = withSetFlashMessage(MediaCondensedComponent);

const MediaCondensedContainer = Relay.createContainer(ConnectedMediaCondensedComponent, {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        type
        picture
        last_seen
        share_count
        title
        permissions
        requests_count
        media {
          metadata
        }
        team {
          team_bot_installations(first: 10000) {
            edges {
              node {
                id
                team_bot: bot_user {
                  id
                  identifier
                }
              }
            }
          }
        }
        relationship {
          id
          source { id, dbid }
          target { id, dbid }
          permissions
        }
      }
    `,
  },
});

const MediaCondensed = (props) => {
  const projectId = getCurrentProjectId(props.media.project_ids);
  const ids = `${props.media.dbid},${projectId}`;
  const route = new MediaRoute({ ids });
  const cachedMedia = Object.assign({}, props.media);

  if (props.media.dbid === 0 || props.noQuery) {
    return (
      <ConnectedMediaCondensedComponent cachedMedia={cachedMedia} {...props} />
    );
  }

  return (
    <Relay.RootContainer
      Component={MediaCondensedContainer}
      renderFetched={data =>
        <MediaCondensedContainer cachedMedia={cachedMedia} {...props} {...data} />}
      route={route}
    />
  );
};

export default MediaCondensed;
