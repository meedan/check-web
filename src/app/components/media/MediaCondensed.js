import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import CardHeader from '@material-ui/core/CardHeader';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import TextField from '@material-ui/core/TextField';
import Menu from '@material-ui/core/Menu';
import IconButton from '@material-ui/core/IconButton';
import IconMoreVert from '@material-ui/icons/MoreVert';
import Can from '../Can';
import { withSetFlashMessage } from '../FlashMessage';
import TimeBefore from '../TimeBefore';
import MediaUtil from './MediaUtil';
import MediaRoute from '../../relay/MediaRoute';
import CheckContext from '../../CheckContext';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import DeleteRelationshipMutation from '../../relay/mutations/DeleteRelationshipMutation';
import UpdateRelationshipMutation from '../../relay/mutations/UpdateRelationshipMutation';
import { truncateLength, getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import { black87 } from '../../styles/js/shared';

const messages = defineMessages({
  editReport: {
    id: 'mediaCondensed.editReport',
    defaultMessage: 'Edit',
  },
  editReportError: {
    id: 'mediaCondensed.editReportError',
    defaultMessage: 'Sorry, an error occurred while updating the item. Please try again and contact {supportEmail} if the condition persists.',
  },
  errorBreakRelationship: {
    id: 'mediaCondensed.breakRelationshipError',
    defaultMessage: 'Sorry, an error occurred while breaking the relationship. Please try again and contact {supportEmail} if the condition persists.',
  },
  errorUpdateRelationship: {
    id: 'mediaCondensed.updateRelationshipError',
    defaultMessage: 'Sorry, an error occurred while updating the relationship. Please try again and contact {supportEmail} if the condition persists.',
  },
});

class MediaCondensedComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      broken: false,
    };
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  getDescription() {
    return (typeof this.state.description === 'string') ? this.state.description.trim() : this.props.media.description;
  }

  getTitle() {
    return (typeof this.state.title === 'string') ? this.state.title.trim() : this.props.media.title;
  }

  handleEdit() {
    this.setState({ isEditing: true, anchorEl: null });
  }

  handleCancel() {
    this.setState({
      isEditing: false,
      title: null,
      description: null,
    });
  }

  handleCloseDialogs() {
    this.setState({
      isEditing: false,
    });
  }

  canSubmit = () => {
    const { title, description } = this.state;
    const permissions = JSON.parse(this.props.media.permissions);
    return (permissions['update Dynamic'] !== false && (typeof title === 'string' || typeof description === 'string'));
  };

  handleChangeTitle(e) {
    this.setState({ title: e.target.value });
  }

  handleChangeDescription(e) {
    this.setState({ description: e.target.value });
  }

  handleSave(media, event) {
    if (event) {
      event.preventDefault();
    }

    const embed = {};

    const { title, description } = this.state;

    if (typeof title === 'string') {
      embed.title = title.trim();
    }

    if (typeof description === 'string') {
      embed.description = description.trim();
    }

    if (embed.title === '' && media.media.embed_path) {
      embed.title = media.media.embed_path.split('/').pop().replace('embed_', '');
    }

    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(messages.editReportError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
      this.props.setFlashMessage(message);
    };

    if (this.canSubmit()) {
      Relay.Store.commitUpdate(
        new UpdateProjectMediaMutation({
          media,
          metadata: JSON.stringify(embed),
          id: media.id,
        }),
        { onFailure },
      );
    }

    this.handleCancel();
  }

  handleBreakRelationship() {
    const onFailure = () => {
      const message = this.props.intl.formatMessage(messages.errorBreakRelationship, { supportEmail: stringHelper('SUPPORT_EMAIL') });
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
      const message = this.props.intl.formatMessage(messages.errorUpdateRelationship, { supportEmail: stringHelper('SUPPORT_EMAIL') });
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

    let smoochBotInstalled = false;
    if (media.team && media.team.team_bot_installations) {
      media.team.team_bot_installations.edges.forEach((edge) => {
        if (edge.node.team_bot.identifier === 'smooch') {
          smoochBotInstalled = true;
        }
      });
    }

    const editDialog = (
      <Dialog
        open={this.state.isEditing}
        onClose={this.handleCloseDialogs.bind(this)}
      >
        <DialogTitle>
          {this.props.intl && this.props.intl.formatMessage(messages.editReport)}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={this.handleSave.bind(this, media)} name="edit-media-form">
            <TextField
              type="text"
              label={
                <FormattedMessage
                  id="mediaCondensed.title"
                  defaultMessage="Title"
                />
              }
              defaultValue={this.getTitle()}
              onChange={this.handleChangeTitle.bind(this)}
              margin="normal"
              fullWidth
            />
            <TextField
              type="text"
              label={
                <FormattedMessage
                  id="mediaCondensed.description"
                  defaultMessage="Description"
                />
              }
              defaultValue={this.getDescription()}
              onChange={this.handleChangeDescription.bind(this)}
              margin="normal"
              fullWidth
              multiline
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleCancel.bind(this)}>
            <FormattedMessage
              id="mediaCondensed.cancelButton"
              defaultMessage="Cancel"
            />
          </Button>
          <Button
            onClick={this.handleSave.bind(this, media)}
            disabled={!this.canSubmit()}
            color="primary"
          >
            <FormattedMessage
              id="mediaCondensed.doneButton"
              defaultMessage="Done"
            />
          </Button>
        </DialogActions>
      </Dialog>
    );

    const { mediaUrl } = this.props;

    return (
      <span style={{ display: 'block', position: 'relative' }}>
        <CardHeader
          title={
            <Link to={mediaUrl} className="media-condensed__title">
              <span style={{ color: black87 }}>
                {truncateLength(media.title, 120)}
              </span>
            </Link>}
          subheader={
            <p>
              <Link to={mediaUrl}>
                <span>{MediaUtil.mediaTypeLabel(media.type, this.props.intl)}</span>
                { smoochBotInstalled ?
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
                <TimeBefore date={MediaUtil.createdAt({ published: media.last_seen })} />
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
          }}
        />
        { !media.archived ?
          <div>
            <IconButton
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
              }}
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
              { (media.relationships && media.relationships.sources_count > 0) ?
                <Can permissions={media.relationship.permissions} permission="update Relationship">
                  <MenuItem key="promote" className="media-condensed__promote-relationshp" onClick={this.handlePromoteRelationship.bind(this)}>
                    <ListItemText
                      primary={
                        <FormattedMessage id="mediaCondensed.promote" defaultMessage="Promote to primary item" />
                      }
                    />
                  </MenuItem>
                </Can> : null }
              { (media.relationships && media.relationships.sources_count > 0) ?
                <Can permissions={media.relationship.permissions} permission="destroy Relationship">
                  <MenuItem key="break" className="media-condensed__break-relationship" onClick={this.handleBreakRelationship.bind(this)} >
                    <ListItemText
                      primary={
                        <FormattedMessage id="mediaCondensed.break" defaultMessage="Break relation to primary item" />
                      }
                    />
                  </MenuItem>
                </Can> : null }
              <Can permissions={media.permissions} permission="update ProjectMedia">
                <MenuItem key="edit" className="media-condensed__edit" onClick={this.handleEdit.bind(this)}>
                  <ListItemText
                    primary={
                      <FormattedMessage id="mediaCondensed.edit" defaultMessage="Edit title and description" />
                    }
                  />
                </MenuItem>
              </Can>
            </Menu>
          </div> : null }
        { this.state.isEditing ? editDialog : null }
      </span>
    );
  }
}

MediaCondensedComponent.propTypes = {
  intl: PropTypes.object.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

MediaCondensedComponent.contextTypes = {
  store: PropTypes.object,
};

const ConnectedMediaCondensedComponent = withSetFlashMessage(injectIntl(MediaCondensedComponent));

const MediaCondensedContainer = Relay.createContainer(ConnectedMediaCondensedComponent, {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        title
        description
        archived
        type
        overridden
        metadata
        picture
        last_seen
        share_count
        permissions
        requests_count
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
  const ids = `${props.media.dbid},${props.media.project_id}`;
  const route = new MediaRoute({ ids });
  const cachedMedia = Object.assign({}, props.media);

  if (props.media.dbid === 0) {
    return (
      <ConnectedMediaCondensedComponent {...props} />
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
