import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { browserHistory, Link } from 'react-router';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { withStyles } from '@material-ui/core/styles';
import IconReport from '@material-ui/icons/PlaylistAddCheck';
import MediaStatus from './MediaStatus';
import MediaRoute from '../../relay/MediaRoute';
import MediaActionsMenuButton from './MediaActionsMenuButton';
import Attribution from '../task/Attribution';
import AddProjectMediaToProjectAction from './AddProjectMediaToProjectAction';
import MoveProjectMediaToProjectAction from './MoveProjectMediaToProjectAction';
import UpdateProjectMediaMutation from '../../relay/mutations/UpdateProjectMediaMutation';
import UpdateStatusMutation from '../../relay/mutations/UpdateStatusMutation';
import CheckContext from '../../CheckContext';
import globalStrings from '../../globalStrings';
import { withSetFlashMessage } from '../FlashMessage';
import { stringHelper } from '../../customHelpers';
import { getErrorMessage } from '../../helpers';

const Styles = theme => ({
  root: {
    display: 'flex',
    width: '100%',
    height: 64,
    alignItems: 'center',
    padding: '0 16px',
    justifyContent: 'space-between',
    [theme.breakpoints.up(1500)]: {
      top: 0,
      right: 0,
      width: '50%',
      position: 'absolute',
      zIndex: 2,
    },
  },
  spacedButton: {
    marginRight: theme.spacing(1),
  },
});

class MediaActionsBarComponent extends Component {
  static handleReportDesigner() {
    const path = `${window.location.pathname}/report`;
    browserHistory.push(path);
  }

  constructor(props) {
    super(props);

    this.state = {
      openAssignDialog: false,
    };
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  currentProject() {
    const { project_media_project: projectMediaProject } = this.props.media;
    return projectMediaProject ? projectMediaProject.project : null;
  }

  fail(transaction) {
    const fallbackMessage = (
      <FormattedMessage
        {...globalStrings.unknownError}
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    );
    const message = getErrorMessage(transaction, fallbackMessage);
    this.props.setFlashMessage(message);
  }

  canSubmit = () => {
    const { title, description } = this.state;
    const permissions = JSON.parse(this.props.media.permissions);
    return (permissions['update Dynamic'] !== false && (typeof title === 'string' || typeof description === 'string'));
  };

  handleSendToTrash() {
    const onSuccess = (response) => {
      const pm = response.updateProjectMedia.project_media;
      const message = (
        <FormattedMessage
          id="mediaActionsBar.movedToTrash"
          defaultMessage="Sent to {trash}"
          values={{
            trash: (
              <Link to={`/${pm.team.slug}/trash`}>
                <FormattedMessage id="mediaDetail.trash" defaultMessage="Trash" />
              </Link>
            ),
          }}
        />
      );
      this.props.setFlashMessage(message);
    };

    const context = this.getContext();
    if (context.team && !context.team.public_team) {
      context.team.public_team = Object.assign({}, context.team);
    }

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        archived: 1,
        check_search_team: this.props.media.team.search,
        check_search_project: this.props.media.project ? this.props.media.project.search : null,
        check_search_trash: this.props.media.team.check_search_trash,
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
      openAssignDialog: false,
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
        status_id: media.last_status_obj.id,
        locked: !media.last_status_obj.locked,
      },
    };

    Relay.Store.commitUpdate(
      new UpdateStatusMutation(statusAttr),
      { onFailure: this.fail },
    );
  }

  handleAssign() {
    this.setState({ openAssignDialog: true });
  }

  handleAssignProjectMedia() {
    const { media } = this.props;

    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="mediaActionsBar.assignmentsUpdated"
          defaultMessage="Assignments updated successfully!"
        />
      );
      this.props.setFlashMessage(message);
    };

    const status_id = media.last_status_obj ? media.last_status_obj.id : '';

    const assignment = document.getElementById(`attribution-media-${media.dbid}`).value;

    const statusAttr = {
      parent_type: 'project_media',
      annotated: media,
      annotation: {
        status_id,
        assigned_to_ids: assignment,
      },
    };

    Relay.Store.commitUpdate(
      new UpdateStatusMutation(statusAttr),
      { onSuccess, onFailure: this.fail },
    );

    this.setState({ openAssignDialog: false });
  }

  handleRestore() {
    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="mediaActionsBar.movedBack"
          defaultMessage="Restored from trash"
        />
      );
      this.props.setFlashMessage(message);
    };

    const context = this.getContext();
    if (context.team && !context.team.public_team) {
      context.team.public_team = Object.assign({}, context.team);
    }

    Relay.Store.commitUpdate(
      new UpdateProjectMediaMutation({
        id: this.props.media.id,
        media: this.props.media,
        archived: 0,
        check_search_team: this.props.media.team.search,
        check_search_project: this.currentProject() ? this.currentProject().search : null,
        check_search_trash: this.props.media.team.check_search_trash,
        context,
        srcProj: null,
        dstProj: null,
      }),
      { onSuccess, onFailure: this.fail },
    );
  }

  render() {
    const { classes, media } = this.props;
    const { project_media_project: projectMediaProject } = media;

    let smoochBotInstalled = false;
    if (media.team && media.team.team_bot_installations) {
      media.team.team_bot_installations.edges.forEach((edge) => {
        if (edge.node.team_bot.identifier === 'smooch') {
          smoochBotInstalled = true;
        }
      });
    }
    let isChild = false;
    let isParent = false;
    if (media.relationship) {
      if (media.relationship.target_id === media.dbid) {
        isChild = true;
      } else if (media.relationship.source_id === media.dbid) {
        isParent = true;
      }
    }
    const readonlyStatus = smoochBotInstalled && isChild && !isParent;
    const published = (media.dynamic_annotation_report_design && media.dynamic_annotation_report_design.data && media.dynamic_annotation_report_design.data.state === 'published');

    const assignments = media.last_status_obj.assignments.edges;

    const assignDialogActions = [
      <Button
        color="primary"
        onClick={this.handleCloseDialogs.bind(this)}
        key="mediaActionsBar.cancelButton"
      >
        <FormattedMessage id="mediaActionsBar.cancelButton" defaultMessage="Cancel" />
      </Button>,
      <Button
        color="primary"
        onClick={this.handleAssignProjectMedia.bind(this)}
        key="mediaActionsBar.done"
      >
        <FormattedMessage id="mediaActionsBar.done" defaultMessage="Done" />
      </Button>,
    ];

    return (
      <div className={classes.root}>
        { !media.archived ?
          <div>
            <AddProjectMediaToProjectAction
              team={this.props.media.team}
              projectMedia={this.props.media}
              className={classes.spacedButton}
            />

            {projectMediaProject ? (
              <MoveProjectMediaToProjectAction
                team={this.props.media.team}
                project={projectMediaProject.project}
                projectMedia={this.props.media}
                projectMediaProject={projectMediaProject}
                className={classes.spacedButton}
              />
            ) : null}

            <Button
              onClick={MediaActionsBarComponent.handleReportDesigner}
              id="media-detail__report-designer"
              variant="outlined"
              className={classes.spacedButton}
              startIcon={<IconReport />}
            >
              { published ?
                <FormattedMessage
                  id="mediaActionsBar.publishedReport"
                  defaultMessage="Published report"
                /> :
                <FormattedMessage
                  id="mediaActionsBar.unpublishedReport"
                  defaultMessage="Unpublished report"
                /> }
            </Button>
          </div> : <div />}

        <div
          style={{
            display: 'flex',
          }}
        >
          <MediaStatus
            media={media}
            readonly={media.archived || media.last_status_obj.locked || readonlyStatus || published}
          />

          <MediaActionsMenuButton
            style={{
              height: 36,
              marginTop: -5,
            }}
            key={media.id /* close menu if we navigate to a different projectMedia */}
            projectMedia={media}
            handleRefresh={this.handleRefresh.bind(this)}
            handleSendToTrash={this.handleSendToTrash.bind(this)}
            handleRestore={this.handleRestore.bind(this)}
            handleAssign={this.handleAssign.bind(this)}
            handleStatusLock={this.handleStatusLock.bind(this)}
          />
        </div>

        <Dialog
          open={this.state.openAssignDialog}
          onClose={this.handleCloseDialogs.bind(this)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <FormattedMessage
              id="mediaActionsBar.assignDialogHeader"
              defaultMessage="Assignment"
            />
          </DialogTitle>
          <DialogContent>
            <Attribution
              multi
              selectedUsers={assignments}
              id={`media-${media.dbid}`}
            />
          </DialogContent>
          <DialogActions>
            {assignDialogActions}
          </DialogActions>
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
        ${AddProjectMediaToProjectAction.getFragment('projectMedia')}
        ${MoveProjectMediaToProjectAction.getFragment('projectMedia')}
        ${MediaActionsMenuButton.getFragment('projectMedia')}
        dbid
        project_ids
        title
        demand
        description
        permissions
        url
        quote
        archived
        dynamic_annotation_report_design {
          id
          data
        }
        project_media_project(project_id: $projectId){
          id
          ${MoveProjectMediaToProjectAction.getFragment('projectMediaProject')}
          project {
            id
            ${MoveProjectMediaToProjectAction.getFragment('project')}
            dbid
            title
            search_id
            search { id, number_of_results }
            medias_count
          }
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
        relationship {
          id
          dbid
          target_id
          source_id
        }
        team {
          ${AddProjectMediaToProjectAction.getFragment('team')}
          ${MoveProjectMediaToProjectAction.getFragment('team')}
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
      }
    `,
  },
});

// eslint-disable-next-line react/no-multi-comp
class MediaActionsBar extends React.PureComponent {
  render() {
    const { projectId, projectMediaId } = this.props;
    const ids = `${projectMediaId},${projectId}`;
    const projectIdValue = projectId == null ? 0 : projectId;
    const route = new MediaRoute({ ids, projectId: projectIdValue });

    return (
      <Relay.RootContainer
        Component={MediaActionsBarContainer}
        renderFetched={data => <MediaActionsBarContainer {...this.props} {...data} />}
        route={route}
      />
    );
  }
}

export default MediaActionsBar;
