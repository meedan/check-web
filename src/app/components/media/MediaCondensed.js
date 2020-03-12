import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import Avatar from 'material-ui/Avatar';
import CardHeader from '@material-ui/core/CardHeader';
import MenuItem from 'material-ui/MenuItem';
import Button from '@material-ui/core/Button';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import IconMenu from 'material-ui/IconMenu';
import IconButton from '@material-ui/core/IconButton';
import IconMoreVert from 'material-ui/svg-icons/navigation/more-vert';
import Can from '../Can';
import TimeBefore from '../TimeBefore';
import MediaUtil from './MediaUtil';
import MediaRoute from '../../relay/MediaRoute';
import CheckContext from '../../CheckContext';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import DeleteRelationshipMutation from '../../relay/mutations/DeleteRelationshipMutation';
import UpdateRelationshipMutation from '../../relay/mutations/UpdateRelationshipMutation';
import { truncateLength, getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';

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

  handleClickHeader() {
    const { mediaUrl, mediaQuery } = this.props;
    this.getContext().history.push({ pathname: mediaUrl, state: { query: mediaQuery } });
  }

  handleEdit() {
    this.setState({ isEditing: true });
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
      this.context.setMessage(message);
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
      this.context.setMessage(message);
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

    this.setState({ broken: true });
  }

  handlePromoteRelationship() {
    const { id, source, target } = this.props.media.relationship;

    const onFailure = () => {
      const message = this.props.intl.formatMessage(messages.errorUpdateRelationship, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      this.context.setMessage(message);
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
  }

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
        modal
        title={this.props.intl.formatMessage(messages.editReport)}
        open={this.state.isEditing}
        onRequestClose={this.handleCloseDialogs.bind(this)}
        autoScrollBodyContent
      >
        <form onSubmit={this.handleSave.bind(this, media)} name="edit-media-form">
          <TextField
            type="text"
            floatingLabelText={
              <FormattedMessage
                id="mediaCondensed.title"
                defaultMessage="Title"
              />
            }
            defaultValue={this.getTitle()}
            onChange={this.handleChangeTitle.bind(this)}
            style={{ width: '100%' }}
          />

          <TextField
            type="text"
            floatingLabelText={
              <FormattedMessage
                id="mediaCondensed.description"
                defaultMessage="Description"
              />
            }
            defaultValue={this.getDescription()}
            onChange={this.handleChangeDescription.bind(this)}
            style={{ width: '100%' }}
            multiLine
          />
        </form>

        <span style={{ display: 'flex' }}>
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
        </span>
      </Dialog>
    );

    return (
      <span style={{ display: 'block', position: 'relative' }}>
        <CardHeader
          title={truncateLength(media.title, 120)}
          subheader={
            <p>
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
            </p>
          }
          avatar={
            <Avatar
              src={media.picture}
              size={100}
              style={{
                borderRadius: 0,
              }}
            />
          }
          onClick={this.handleClickHeader.bind(this)}
          style={{
            cursor: 'pointer',
            padding: 0,
            height: 100,
          }}
          titleStyle={{
            paddingRight: 120,
            margin: '16px 0',
          }}
        />
        { !media.archived ?
          <IconMenu
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
            }}
            iconButtonElement={
              <IconButton
                tooltip={
                  <FormattedMessage id="mediaCondensed.tooltip" defaultMessage="Item actions" />
                }
              >
                <IconMoreVert className="media-actions__icon" />
              </IconButton>}
          >
            { (media.relationships && media.relationships.sources_count > 0) ?
              <Can permissions={media.relationship.permissions} permission="update Relationship">
                <MenuItem key="promote" onClick={this.handlePromoteRelationship.bind(this)}>
                  <FormattedMessage id="mediaCondensed.promote" defaultMessage="Promote to primary item" />
                </MenuItem>
              </Can> : null }
            { (media.relationships && media.relationships.sources_count > 0) ?
              <Can permissions={media.relationship.permissions} permission="destroy Relationship">
                <MenuItem key="break" onClick={this.handleBreakRelationship.bind(this)}>
                  <FormattedMessage id="mediaCondensed.break" defaultMessage="Break relation to primary item" />
                </MenuItem>
              </Can> : null }
            <Can permissions={media.permissions} permission="update ProjectMedia">
              <MenuItem key="edit" onClick={this.handleEdit.bind(this)}>
                <FormattedMessage id="mediaCondensed.edit" defaultMessage="Edit title and description" />
              </MenuItem>
            </Can>
          </IconMenu> : null }
        { this.state.isEditing ? editDialog : null }
      </span>
    );
  }
}

MediaCondensedComponent.contextTypes = {
  store: PropTypes.object,
  setMessage: PropTypes.func,
};

const MediaCondensedContainer = Relay.createContainer(MediaCondensedComponent, {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        title
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
      <MediaCondensedComponent {...props} />
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

export default injectIntl(MediaCondensed);
