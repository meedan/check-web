import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import MultiSelector from '../layout/MultiSelector';
import ItemHistoryDialog from './ItemHistoryDialog';
import MediaStatus from './MediaStatus';
import MediaRoute from '../../relay/MediaRoute';
import MediaActionsMenuButton from './MediaActionsMenuButton';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import UpdateStatusMutation from '../../relay/mutations/UpdateStatusMutation';
import CheckContext from '../../CheckContext';
import globalStrings from '../../globalStrings';
import { withSetFlashMessage } from '../FlashMessage';
import { stringHelper } from '../../customHelpers';
import { getErrorMessage } from '../../helpers';
import CheckArchivedFlags from '../../CheckArchivedFlags';

const Styles = theme => ({
  root: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spacedButton: {
    marginRight: theme.spacing(1),
  },
  inputRoot: {
    flex: '1 0 auto',
    margin: theme.spacing(1),
  },
  spaced: {
    margin: theme.spacing(1),
  },
  title: {
    margin: theme.spacing(2),
    outline: 0,
  },
});

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
      // eslint-disable-next-line @calm/react-intl/missing-attribute
      <FormattedMessage
        {...globalStrings.unknownError}
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    );
    const message = getErrorMessage(transaction, fallbackMessage);
    this?.props.setFlashMessage(message, 'error');
  }

  canSubmit = () => {
    const { title, description } = this.state;
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
          id="mediaActionsBar.movedToTrash"
          defaultMessage="The item was moved to {trash}"
          description="Delete item action success message"
          values={{
            trash: (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid
              <a onClick={() => browserHistory.push(`/${pm.team.slug}/trash`)}>
                <FormattedMessage
                  id="mediaDetail.trash"
                  defaultMessage="Trash"
                  description="Label used inside delete action success message. Links to the Trash page"
                />
              </a>
            ),
          }}
        />
      ) : (
        <FormattedMessage
          id="mediaActionsBar.movedToSpam"
          defaultMessage="The item was moved to {spam}"
          description="Send item to spam action success message"
          values={{
            spam: (
              // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/anchor-is-valid
              <a onClick={() => browserHistory.push(`/${pm.team.slug}/spam`)}>
                <FormattedMessage
                  id="mediaDetail.spam"
                  defaultMessage="Spam"
                  description="Label used inside 'send to spam' action success message. Links to the Spam page"
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
          id="mediaActionsBar.assignmentsUpdated"
          defaultMessage="Assignments updated successfully"
          description="Success message displayed when assigned user is updated"
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
    const { classes, media } = this.props;

    const isParent = !(media?.suggested_main_item || media?.is_confirmed_similar_to_another_item);

    const published = (media.dynamic_annotation_report_design && media.dynamic_annotation_report_design?.data && media?.dynamic_annotation_report_design?.data?.state === 'published');

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

    return (
      <div className={classes.root}>
        <Box display="flex">
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
            key={media.id /* close menu if we navigate to a different projectMedia */}
            projectMedia={media}
            isParent={isParent}
            handleRefresh={this.handleRefresh.bind(this)}
            handleSendToTrash={this.handleSendToTrash.bind(this)}
            handleSendToSpam={this.handleSendToSpam.bind(this)}
            handleAssign={this.handleAssign.bind(this)}
            handleStatusLock={this.handleStatusLock.bind(this)}
            handleItemHistory={this.handleItemHistory}
          />
        </Box>

        <ItemHistoryDialog
          open={this.state.itemHistoryDialogOpen}
          onClose={this.handleCloseDialogs.bind(this)}
          projectMedia={media}
          team={media.team}
        />

        {/* FIXME Extract to dedicated AssignmentDialog component */}
        <Dialog
          className="project__assignment-menu"
          open={this.state.assignmentDialogOpened}
          onClose={this.handleCloseDialogs.bind(this)}
        >
          <DialogTitle>
            <FormattedMessage
              id="mediaActionsBar.assignmentTitle"
              defaultMessage="Assign item to collaborators"
              description="Assignment dialog title"
            />
          </DialogTitle>
          <DialogContent>
            <Box display="flex" style={{ outline: 0 }}>
              <FormattedMessage
                id="multiSelector.search"
                defaultMessage="Search…"
                description="Search box placeholder"
              >
                {placeholder => (
                  <MultiSelector
                    allowToggleAll
                    allowSearch
                    inputPlaceholder={placeholder}
                    toggleAllLabel={
                      <FormattedMessage
                        id="MultiSelector.all"
                        defaultMessage="All"
                        description="Checkbox label for toggling select/unselect all"
                      />
                    }
                    cancelLabel={<FormattedMessage {...globalStrings.cancel} /> /* eslint-disable-line @calm/react-intl/missing-attribute */}
                    submitLabel={<FormattedMessage {...globalStrings.update} /> /* eslint-disable-line @calm/react-intl/missing-attribute */}
                    options={options}
                    selected={selected}
                    onDismiss={this.handleCloseDialogs.bind(this)}
                    onSubmit={this.handleAssignProjectMedia.bind(this)}
                  />
                )}
              </FormattedMessage>
              <div className={classes.spaced}>
                <Typography variant="body1" component="div" className={classes.spaced}>
                  <FormattedMessage
                    id="mediaActionsBar.assignmentNotesTitle"
                    defaultMessage="Add a note to the email"
                    description="Helper text to field for adding details about the assignment"
                  />
                </Typography>
                <TextField
                  variant="outlined"
                  inputRef={(element) => {
                    this.assignmentMessageRef = element;
                    return element;
                  }}
                  rows={21}
                  InputProps={{ classes: { root: classes.inputRoot } }}
                  multiline
                />
              </div>
            </Box>
          </DialogContent>
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
  withStyles(Styles)(withSetFlashMessage(MediaActionsBarComponent));

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
        project {
          id
          dbid
          title
          search_id
          search { id, number_of_results }
          medias_count
        }
        media {
          url
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
