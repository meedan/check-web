import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import ClearIcon from '@material-ui/icons/Clear';
import RoleSelect from './RoleSelect';
import CheckContext from '../../CheckContext';
import ConfirmDialog from '../layout/ConfirmDialog';
import '../../styles/css/tooltip.css';
import UpdateTeamUserMutation from '../../relay/mutations/UpdateTeamUserMutation';
import UserTooltip from '../user/UserTooltip';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import { withSetFlashMessage } from '../FlashMessage';
import globalStrings from '../../globalStrings';
import {
  Text,
  buttonInButtonGroupStyle,
  black38,
  black87,
  white,
} from '../../styles/js/shared';

const Styles = {
  tooltip: {
    width: 300,
    minHeight: 60,
    backgroundColor: white,
    color: black87,
    border: `1px solid ${black38}`,
  },
  tooltipArrow: {
    color: black38,
  },
  name: {
    display: 'flex', // avatar+name should appear beside each other
    alignItems: 'center',
    flex: '0 0 auto', // tooltip should appear immediately beside text
  },
  actions: {
    flex: '1 1 auto',
    display: 'flex', // don't wrap
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
};

const DeleteMessage = ({ userIsSelf, selfIsOwner, singleOwner }) => {
  if (userIsSelf) {
    return <FormattedMessage id="TeamMembersListItem.leaveTeam" defaultMessage="Leave workspace" />;
  }

  if (selfIsOwner && singleOwner) {
    return (
      <FormattedMessage
        id="TeamMembersListItem.singleOwner"
        defaultMessage="Before you can leave the workspace, please transfer ownership to another member."
      />
    );
  }

  return <FormattedMessage id="TeamMembersListItem.deleteMember" defaultMessage="Remove member" />;
};

const LinkWithForwardedRef = React.forwardRef((props, ref) => <Link {...props} innerRef={ref} />);
LinkWithForwardedRef.displayName = 'LinkWithForwardedRef';

class TeamMembersListItem extends Component {
  state = {
    dialogOpen: false,
    mode: null,
  };

  canEditRole = () => {
    const { isEditing, teamUser } = this.props;
    const context = new CheckContext(this).getContextStore();
    const { currentUser } = context;
    return isEditing && teamUser.status === 'member' && (currentUser.is_admin || teamUser.user_id !== currentUser.dbid);
  };

  handleCloseDialog = () => {
    this.setState({ dialogOpen: false, mode: null });
  };

  handleConfirmDelete = () => {
    this.handleCloseDialog();
    this.handleDeleteTeamUser();
  };

  handleDeleteButtonClick = () => {
    const { teamUser } = this.props;
    const context = new CheckContext(this).getContextStore();
    const { currentUser } = context;
    const userIsSelf = teamUser.user_id === currentUser.dbid;
    this.setState({ dialogOpen: true, mode: userIsSelf ? 'leave' : 'remove' });
  };

  fail = (transaction) => {
    const fallbackMessage = (
      <FormattedMessage
        {...globalStrings.unknownError}
        values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
      />
    );
    const message = getErrorMessage(transaction, fallbackMessage);
    this.props.setFlashMessage(message);
  };

  handleDeleteTeamUser() {
    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
        team: this.props.team, // To manipulate its TeamUser lists
        teamUser: this.props.teamUser,
        status: 'banned',
      }),
      { onFailure: this.fail },
    );
  }

  handleRoleChange = (e) => {
    this.setState({ dialogOpen: true, mode: 'edit_role', role: e.target.value });
  };

  handleTeamMembershipRequest(status) {
    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
        team: this.props.team, // To manipulate its TeamUser lists
        teamUser: this.props.teamUser,
        status,
      }),
      { onFailure: this.fail },
    );
  }

  submitRoleChange = () => {
    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
        team: this.props.team, // To manipulate its TeamUser lists
        teamUser: this.props.teamUser,
        role: this.state.role,
      }),
      { onFailure: this.fail },
    );
    this.setState({ role: null, dialogOpen: false });
  };

  renderConfirmDialog = () => {
    const { teamUser: { user }, team } = this.props;

    const titles = {
      leave: <FormattedMessage
        id="TeamMembersListItem.confirmLeaveTitle"
        defaultMessage="Are you sure you want to leave {team}?"
        values={{ team: team.name }}
      />,
      remove: <FormattedMessage
        id="TeamMembersListItem.confirmDeleteMemberTitle"
        defaultMessage="Are you sure you want to remove {user}?"
        values={{ user: user.name }}
      />,
      edit_role: <FormattedMessage
        id="TeamMembersListItem.confirmEditMemberTitle"
        defaultMessage="Are you sure you want to change {user}'s role?"
        values={{ user: user.name }}
      />,
    };

    const blurbs = {
      leave: <FormattedMessage
        id="TeamMembersListItem.confirmLeaveBlurb"
        defaultMessage="You will be removed from {team}"
        values={{ team: team.name }}
      />,
      remove: <FormattedMessage
        id="TeamMembersListItem.confirmDeleteMemberBlurb"
        defaultMessage="User will be removed from {team}"
        values={{ team: team.name }}
      />,
    };

    const callbacks = {
      leave: this.handleConfirmDelete,
      remove: this.handleConfirmDelete,
      edit_role: this.submitRoleChange,
    };

    return (this.state.dialogOpen
      ? <ConfirmDialog
        open={this.state.dialogOpen}
        title={titles[this.state.mode]}
        blurb={blurbs[this.state.mode]}
        handleClose={this.handleCloseDialog}
        handleConfirm={callbacks[this.state.mode]}
      />
      : null
    );
  };

  render() {
    const context = new CheckContext(this).getContextStore();
    const { currentUser } = context;
    const {
      teamUser,
      isEditing,
      singleOwner,
      requestingMembership,
      classes,
    } = this.props;
    const userIsSelf = teamUser.user_id === currentUser.dbid;
    const selfIsOwner = userIsSelf && teamUser.role === 'owner';

    return (
      <ListItem className="team-members__member">
        <Tooltip
          placement="right"
          interactive
          arrow
          classes={{ tooltip: classes.tooltip }}
          title={<UserTooltip teamUser={teamUser} />}
        >
          <LinkWithForwardedRef className={classes.name} to={`/check/user/${teamUser.user.dbid}`}>
            <ListItemAvatar>
              <Avatar
                src={
                  teamUser.user.source ? teamUser.user.source.image : null
                }
                alt={teamUser.user.name}
              />
            </ListItemAvatar>
            <ListItemText>
              <Text breakWord>{teamUser.user.name}</Text>
            </ListItemText>
          </LinkWithForwardedRef>
        </Tooltip>

        <div className={classes.actions}>
          {requestingMembership ? (
            <React.Fragment>
              <Button
                variant="contained"
                style={buttonInButtonGroupStyle}
                onClick={this.handleTeamMembershipRequest.bind(this, 'member')}
                className="team-member-requests__user-button--approve"
              >
                <FormattedMessage
                  id="TeamMembershipRequestsListItem.approve"
                  defaultMessage="Approve"
                />
              </Button>
              <Button
                variant="contained"
                onClick={this.handleTeamMembershipRequest.bind(this, 'banned')}
                className="team-member-requests__user-button--deny"
              >
                <FormattedMessage id="TeamMembershipRequestsListItem.deny" defaultMessage="Reject" />
              </Button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <RoleSelect
                onChange={this.handleRoleChange}
                value={teamUser.role}
                disabled={!this.canEditRole()}
              />

              {isEditing && teamUser.status !== 'banned' ?
                <Tooltip title={
                  <DeleteMessage
                    userIsSelf={userIsSelf}
                    selfIsOwner={selfIsOwner}
                    singleOwner={singleOwner}
                  />
                }
                >
                  <div>
                    <IconButton
                      disabled={singleOwner && userIsSelf && selfIsOwner}
                      className="team-members__delete-member"
                      onClick={this.handleDeleteButtonClick}
                    >
                      <ClearIcon />
                    </IconButton>
                    { this.renderConfirmDialog() }
                  </div>
                </Tooltip>
                : null}
            </React.Fragment>
          )}
        </div>
      </ListItem>
    );
  }
}

TeamMembersListItem.propTypes = {
  setFlashMessage: PropTypes.func.isRequired,
};

TeamMembersListItem.contextTypes = {
  store: PropTypes.object,
};

export default Relay.createContainer(withStyles(Styles)(withSetFlashMessage(TeamMembersListItem)), {
  fragments: {
    team: () => Relay.QL`
      fragment on Team {
        ${UpdateTeamUserMutation.getFragment('team')}
        id
        name
      }
    `,
    teamUser: () => Relay.QL`
      fragment on TeamUser {
        ${UserTooltip.getFragment('teamUser')}
        ${UpdateTeamUserMutation.getFragment('teamUser')}
        id
        role
        status
        user_id
        user {
          id
          name
          dbid
          source {
            image
          }
        }
      }
    `,
  },
});
