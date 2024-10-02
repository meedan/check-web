import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Dialog from '@material-ui/core/Dialog';
import cx from 'classnames/bind';
import ItemHistoryDialog from './ItemHistoryDialog';
import MediaStatus from './MediaStatus';
import MediaTags from './MediaTags.js';
import MediaActionsMenuButton from './MediaActionsMenuButton';
import RestoreProjectMedia from './RestoreProjectMedia';
import ItemTitle from './ItemTitle';
import TextArea from '../cds/inputs/TextArea.js';
import MultiSelector from '../layout/MultiSelector';
import MediaRoute from '../../relay/MediaRoute';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import UpdateStatusMutation from '../../relay/mutations/UpdateStatusMutation';
import CheckContext from '../../CheckContext';
import { withSetFlashMessage } from '../FlashMessage';
import { stringHelper } from '../../customHelpers';
import { getErrorMessage } from '../../helpers';
import CheckArchivedFlags from '../../CheckArchivedFlags';
import ItemThumbnail from '../cds/media-cards/ItemThumbnail';
import dialogStyles from '../../styles/css/dialog.module.css';
import styles from './media.module.css';

class MediaActionsBarComponent extends Component {
  static handleReportDesigner() {
    const path = `${window.location.pathname.replace(/\/(suggested-matches|similar-media)/, '')}/report`;
    browserHistory.push(path);
  }

  constructor(props) {
    super(props);

    this.state = {
      assignmentDialogOpened: false,
      itemHistoryDialogOpen: false,
    };
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  currentProject() {
    const { project } = this.props.media;
    return project;
  }

  fail(transaction) {
    const fallbackMessage = (
      <FormattedMessage
        defaultMessage="Sorry, an error occurred. Please try again and contact {supportEmail} if the condition persists."
        description="Message displayed in error notification when an operation fails unexpectedly"
        id="global.unknownError"
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    );
    const message = getErrorMessage(transaction, fallbackMessage);
    this?.props.setFlashMessage(message, 'error');
  }

  canSubmit = () => {
    const { description, title } = this.state;
    const permissions = JSON.parse(this.props.media.permissions);
    return (permissions['update Dynamic'] !== false && (typeof title === 'string' || typeof description === 'string'));
  };

  handleSendToTrash() {
    this.handleArchiveItem(CheckArchivedFlags.TRASHED);
  }

  handleSendToSpam() {
    this.handleArchiveItem(CheckArchivedFlags.SPAM);
  }

  handleArchiveItem(archived) {
    const onSuccess = (response) => {
      const pm = response.updateProjectMedia.project_media;
      const message = archived === CheckArchivedFlags.TRASHED ? (
        <FormattedMessage
          defaultMessage="The item was moved to {trash}"
          description="Delete item action success message"
          id="mediaActionsBar.movedToTrash"
          values={{
            trash: (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid
              <a id="int-media-actions-toast__link--trash" onClick={() => browserHistory.push(`/${pm.team.slug}/trash`)}>
                <FormattedMessage
                  defaultMessage="Trash"
                  description="Label used inside delete action success message. Links to the Trash page"
                  id="mediaDetail.trash"
                />
              </a>
            ),
          }}
        />
      ) : (
        <FormattedMessage
          defaultMessage="The item was moved to {spam}"
          description="Send item to spam action success message"
          id="mediaActionsBar.movedToSpam"
          values={{
            spam: (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid
              <a id="int-media-actions-toast__link--spam" onClick={() => browserHistory.push(`/${pm.team.slug}/spam`)}>
                <FormattedMessage
                  defaultMessage="Spam"
                  description="Label used inside 'send to spam' action success message. Links to the Spam page"
                  id="mediaDetail.spam"
                />
              </a>
            ),
          }}
        />
      );
      this.props.setFlashMessage(message, 'success');
    };

    const context = this.getContext();
    if (context.team && !context.team.public_team) {
      context.team.public_team = Object.assign({}, context.team);
    }

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        archived,
        check_search_team: this.props.media.team.search,
        check_search_project: this.props.media.project ? this.props.media.project.search : null,
        check_search_trash: this.props.media.team.check_search_trash,
        check_search_spam: this.props.media.team.check_search_spam,
        media: this.props.media,
        context,
        id: this.props.media.id,
        srcProj: null,
        dstProj: null,
      }),
      { onSuccess, onFailure: this.fail },
    );
  }

  handleCancel() {
    this.setState({
      title: null,
      description: null,
    });
  }

  handleCloseDialogs() {
    this.setState({
      assignmentDialogOpened: false,
      itemHistoryDialogOpen: false,
    });
  }

  handleRefresh() {
    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        refresh_media: 1,
        id: this.props.media.id,
        srcProj: null,
        dstProj: null,
      }),
      { onFailure: this.fail },
    );
  }

  handleStatusLock() {
    const { media } = this.props;

    const statusAttr = {
      parent_type: 'project_media',
      annotated: media,
      annotation: {
        status_id: media.last_status_obj?.id,
        locked: !media.last_status_obj?.locked,
      },
    };

    Relay.Store.commitUpdate(
      new UpdateStatusMutation(statusAttr),
      { onFailure: this.fail },
    );
  }

  handleAssign() {
    this.setState({ assignmentDialogOpened: true });
  }

  handleAssignProjectMedia(selected) {
    const { media } = this.props;

    const onSuccess = () => {
      const message = (
        <FormattedMessage
          defaultMessage="Assignments updated successfully"
          description="Success message displayed when assigned user is updated"
          id="mediaActionsBar.assignmentsUpdated"
        />
      );
      this.props.setFlashMessage(message, 'success');
    };

    const status_id = media.last_status_obj ? media.last_status_obj.id : '';

    const statusAttr = {
      parent_type: 'project_media',
      annotated: media,
      annotation: {
        status_id,
        assigned_to_ids: selected.join(','),
        assignment_message: this.assignmentMessageRef.value,
      },
    };

    Relay.Store.commitUpdate(
      new UpdateStatusMutation(statusAttr),
      { onSuccess, onFailure: this.fail },
    );

    this.setState({ assignmentDialogOpened: false });
  }

  handleItemHistory = () => {
    this.setState({ itemHistoryDialogOpen: true });
  };

  render() {
    const { media } = this.props;

    // This is to safeguard agains a null media object that can happen when the component is rendered before the data is fetched
    if (!media) return null;

    const isParent = !(media?.suggested_main_item || media?.is_confirmed_similar_to_another_item);

    const published = media?.dynamic_annotation_report_design?.data?.state === 'published';

    const options = [];
    media.team.team_users?.edges.forEach((teamUser) => {
      if (teamUser.node.status === 'member' && !teamUser.node.user.is_bot) {
        const { user } = teamUser.node;
        options.push({ label: user.name, value: user.dbid.toString() });
      }
    });

    const selected = [];
    if (media.last_status_obj?.assignments?.edges) {
      const assignments = media.last_status_obj.assignments.edges;
      assignments.forEach((user) => {
        selected.push(user.node.dbid.toString());
      });
    }

    const context = this.getContext();

    let restoreProjectMedia = '';
    if (media.archived === CheckArchivedFlags.TRASHED || media.archived === CheckArchivedFlags.SPAM) {
      restoreProjectMedia = (
        <RestoreProjectMedia
          context={context}
          projectMedia={this.props.media}
          team={this.props.media.team}
        />
      );
    }

    return (
      <div className={cx('media-actions-bar', styles['media-actions-wrapper'])}>
        <ItemThumbnail maskContent={media.show_warning_cover} picture={media.media?.picture} type={media.media?.type} url={media.media?.url} />
        <div className={styles['media-actions-title']}>
          <ItemTitle projectMediaId={this.props.media?.dbid} />
          <div className={styles['media-actions-context']}>
            <div className={styles['media-actions-tags']}>
              <MediaTags projectMedia={this.props.media} />
            </div>
            { restoreProjectMedia ? <> {restoreProjectMedia} </> : null }
            <div className={styles['media-actions']}>
              {isParent ?
                <MediaStatus
                  media={media}
                  readonly={(
                    (media.archived > CheckArchivedFlags.NONE && media.archived !== CheckArchivedFlags.UNCONFIRMED) ||
                    media.last_status_obj?.locked ||
                    published
                  )}
                /> : null
              }
              <MediaActionsMenuButton
                handleAssign={this.handleAssign.bind(this)}
                handleItemHistory={this.handleItemHistory}
                handleRefresh={this.handleRefresh.bind(this)}
                handleSendToSpam={this.handleSendToSpam.bind(this)}
                handleSendToTrash={this.handleSendToTrash.bind(this)}
                handleStatusLock={this.handleStatusLock.bind(this)}
                isParent={isParent}
                key={media.id /* close menu if we navigate to a different projectMedia */}
                projectMedia={media}
              />
            </div>
          </div>
        </div>
        <ItemHistoryDialog
          open={this.state.itemHistoryDialogOpen}
          projectMedia={media}
          team={media.team}
          onClose={this.handleCloseDialogs.bind(this)}
        />

        {/* FIXME Extract to dedicated AssignmentDialog component */}
        <Dialog
          className={cx('project__assignment-menu', dialogStyles['dialog-window'])}
          fullWidth
          open={this.state.assignmentDialogOpened}
          onClose={this.handleCloseDialogs.bind(this)}
        >
          <div className={dialogStyles['dialog-title']}>
            <FormattedMessage
              defaultMessage="Assign Item"
              description="Assignment dialog title"
              id="mediaActionsBar.assignmentTitle"
              tagName="h6"
            />
          </div>
          <div className={cx(dialogStyles['dialog-content'], styles['assign-media-dialog-content'])}>
            <FormattedMessage
              defaultMessage="Search…"
              description="Search box placeholder"
              id="multiSelector.search"
            >
              {placeholder => (
                <MultiSelector
                  allowSearch
                  allowToggleAll
                  cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />}
                  inputPlaceholder={placeholder}
                  options={options}
                  selected={selected}
                  submitLabel={<FormattedMessage defaultMessage="Update" description="Generic label for a button or link for a user to press when they wish to update an action" id="global.update" />}
                  toggleAllLabel={
                    <FormattedMessage
                      defaultMessage="All"
                      description="Checkbox label for toggling select/unselect all"
                      id="MultiSelector.all"
                    />
                  }
                  onDismiss={this.handleCloseDialogs.bind(this)}
                  onSubmit={this.handleAssignProjectMedia.bind(this)}
                />
              )}
            </FormattedMessage>
            <div className={styles['assign-media-dialog-note']}>
              <FormattedMessage
                defaultMessage="Include an optional note in the email sent to assigned workspace members"
                description="Placeholder text to field for adding details about the assignment"
                id="mediaActionsBar.assignmentNotesPlaceholder"
              >
                {placeholder => (
                  <TextArea
                    label={
                      <FormattedMessage
                        defaultMessage="Add a Note"
                        description="Title text for field for adding details about the assignment"
                        id="mediaActionsBar.assignmentNotesTitle"
                      />
                    }
                    placeholder={placeholder}
                    ref={(element) => {
                      this.assignmentMessageRef = element;
                      return element;
                    }}
                    rows="21"
                    variant="outlined"
                  />
                )}
              </FormattedMessage>
            </div>
          </div>
        </Dialog>
      </div>
    );
  }
}

MediaActionsBarComponent.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

MediaActionsBarComponent.contextTypes = {
  store: PropTypes.object,
};

const ConnectedMediaActionsBarComponent =
  withSetFlashMessage(MediaActionsBarComponent);

const MediaActionsBarContainer = Relay.createContainer(ConnectedMediaActionsBarComponent, {
  initialVariables: {
    contextId: null,
    projectId: 0,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        ${MediaActionsMenuButton.getFragment('projectMedia')}
        ${RestoreProjectMedia.getFragment('projectMedia')}
        ${MediaTags.getFragment('projectMedia')}
        dbid
        project_id
        title
        demand
        description
        permissions
        url
        quote
        archived
        suggested_main_item
        is_confirmed_similar_to_another_item
        dynamic_annotation_report_design {
          id
          data
        }
        show_warning_cover
        project {
          id
          dbid
          title
          search_id
          search { id, number_of_results }
        }
        media {
          type
          url
          picture
          embed_path
          metadata
        }
        last_status
        last_status_obj {
          id
          dbid
          locked
          content
          assignments(first: 10000) {
            edges {
              node {
                id
                dbid
                name
              }
            }
          }
        }
        team {
          id
          dbid
          slug
          verification_statuses
          medias_count
          trash_count
          public_team {
            id
          }
          search {
            id
            number_of_results
          }
          check_search_trash {
            id
            number_of_results
          }
          check_search_spam {
            id
            number_of_results
          }
          team_users(first: 10000) {
            edges {
              node {
                id
                status
                user {
                  id
                  dbid
                  name
                  is_active
                  is_bot
                  source {
                    id
                    dbid
                    image
                  }
                }
              }
            }
          }
          smooch_bot: team_bot_installation(bot_identifier: "smooch") {
            id
          }
        }
      }
    `,
  },
});

// eslint-disable-next-line react/no-multi-comp
class MediaActionsBar extends React.PureComponent {
  render() {
    const { projectMediaId } = this.props;
    const ids = `${projectMediaId},`;
    const route = new MediaRoute({ ids });

    return (
      <Relay.RootContainer
        Component={MediaActionsBarContainer}
        renderFetched={data => <MediaActionsBarContainer {...this.props} {...data} />}
        route={route}
      />
    );
  }
}
// eslint-disable-next-line import/no-unused-modules
export { MediaActionsBarComponent };
export default MediaActionsBar;
