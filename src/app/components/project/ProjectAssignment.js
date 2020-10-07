import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import IconArrowDropDown from '@material-ui/icons/ArrowDropDown';
import { can } from '../Can';
import MultiSelector from '../layout/MultiSelector';
import ProjectRoute from '../../relay/ProjectRoute';
import { black54 } from '../../styles/js/shared';
import UpdateProjectMutation from '../../relay/mutations/UpdateProjectMutation';
import UserAvatars from '../UserAvatars';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import { withSetFlashMessage } from '../FlashMessage';
import globalStrings from '../../globalStrings';

const Styles = theme => ({
  root: {
    flex: '1 0 auto',
    margin: theme.spacing(1),
  },
  spaced: {
    margin: theme.spacing(1),
  },
});

class ProjectAssignmentComponent extends Component {
  state = {
    assignmentDialogOpened: false,
    message: '',
  };

  handleClick = () => {
    this.setState({ assignmentDialogOpened: true });
  };

  handleClose = () => {
    if (this.props.onDismiss) {
      this.props.onDismiss();
    }

    this.setState({ assignmentDialogOpened: false });
  };

  handleSelect = (selected) => {
    const onFailure = (transaction) => {
      const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
      const message = getErrorMessage(transaction, fallbackMessage);
      this.props.setFlashMessage(message);
    };

    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="projectAssignment.processing"
          defaultMessage="Done! The assignments are now propagating to items and tasks. You will receive an e-mail when it's ready."
        />
      );
      this.props.setFlashMessage(message);
    };

    Relay.Store.commitUpdate(
      new UpdateProjectMutation({
        id: this.props.project.id,
        assigned_to_ids: selected.join(','),
        assignment_message: this.state.message,
      }),
      { onSuccess, onFailure },
    );

    this.handleClose();
  };

  render() {
    if (!can(this.props.project.permissions, 'update Project')) {
      return null;
    }

    const { classes } = this.props;
    const assignmentDialogOpened = this.state.assignmentDialogOpened ||
      this.props.assignmentDialogOpened;
    const buttonStyle = {
      border: 0,
      color: black54,
    };

    const options = [];
    this.props.project.team.team_users.edges.forEach((teamUser) => {
      if (teamUser.node.status === 'member') {
        const { user } = teamUser.node;
        options.push({ label: user.name, value: user.dbid.toString() });
      }
    });
    const selected = [];
    const assignments = this.props.project.assigned_users.edges;
    assignments.forEach((user) => {
      selected.push(user.node.dbid.toString());
    });

    const assignmentPopup = (
      <Dialog
        className="project__assignment-menu"
        open={assignmentDialogOpened}
        onClose={this.handleClose}
      >
        <DialogTitle>
          <FormattedMessage
            id="projectAssignment.title"
            defaultMessage="Assign list to collaborators"
          />
        </DialogTitle>
        <DialogContent>
          <Box display="flex" style={{ outline: 0 }}>
            <MultiSelector
              allowSelectAll
              allowUnselectAll
              allowSearch
              options={options}
              selected={selected}
              onDismiss={this.handleClose}
              onSubmit={this.handleSelect}
            />
            <div className={classes.spaced}>
              <Typography variant="body1" component="div" className={classes.spaced}>
                <FormattedMessage
                  id="projectAssignment.notesTitle"
                  defaultMessage="Add a note to the e-mail"
                />
              </Typography>
              <TextField
                label={
                  <FormattedMessage
                    id="projectAssignment.notes"
                    defaultMessage="Notes"
                  />
                }
                variant="outlined"
                value={this.state.message}
                onChange={(e) => { this.setState({ message: e.target.value }); }}
                rows={21}
                InputProps={{ classes: { root: classes.root } }}
                multiline
              />
            </div>
          </Box>
        </DialogContent>
      </Dialog>
    );

    if (this.props.assignmentDialogOpened) {
      return assignmentPopup;
    }

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button
            className="project__assignment-button"
            onClick={this.handleClick}
            style={buttonStyle}
            disableTouchRipple
          >
            { selected.length > 0 ?
              <FormattedMessage
                id="projectAssignment.assignedTo"
                defaultMessage="Assigned to"
              /> :
              <FormattedMessage
                id="projectAssignment.notAssigned"
                defaultMessage="Not assigned"
              /> }
            <IconArrowDropDown color={black54} />
          </Button>
          { assignmentPopup }
          <UserAvatars users={assignments} showMore />
        </div>
      </div>
    );
  }
}

ProjectAssignmentComponent.propTypes = {
  intl: PropTypes.object.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

const ConnectedProjectAssignmentComponent =
  withStyles(Styles)(withSetFlashMessage(injectIntl(ProjectAssignmentComponent)));

const ProjectAssignmentContainer = Relay.createContainer(ConnectedProjectAssignmentComponent, {
  initialVariables: {
    projectId: null,
  },
  fragments: {
    project: () => Relay.QL`
      fragment on Project {
        id
        dbid
        permissions
        assigned_users(first: 10000) {
          edges {
            node {
              id
              dbid
              name
              source {
                id
                dbid
                image
              }
            }
          }
        }
        team {
          id
          dbid
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
                  source {
                    id
                    dbid
                    image
                  }
                }
              }
            }
          }
        }
      }
    `,
  },
});

const ProjectAssignment = (props) => {
  const { project } = props;
  const route = new ProjectRoute({ projectId: project.dbid.toString() });

  return (
    <Relay.RootContainer
      Component={ProjectAssignmentContainer}
      route={route}
      renderFetched={data => <ProjectAssignmentContainer {...props} {...data} />}
    />
  );
};

export default ProjectAssignment;
