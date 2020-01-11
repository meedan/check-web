import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import { ListItem } from 'material-ui/List';
import MdClear from 'react-icons/lib/md/clear';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import RaisedButton from 'material-ui/RaisedButton';
import rtlDetect from 'rtl-detect';
import RCTooltip from 'rc-tooltip';
import RoleSelect from './RoleSelect';
import CheckContext from '../../CheckContext';
import ConfirmDialog from '../layout/ConfirmDialog';
import '../../styles/css/tooltip.css';
import SourcePicture from '../source/SourcePicture';
import UpdateTeamUserMutation from '../../relay/mutations/UpdateTeamUserMutation';
import UserTooltip from '../user/UserTooltip';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import globalStrings from '../../globalStrings';
import {
  FlexRow,
  Text,
  buttonInButtonGroupStyle,
  Offset,
  inProgressYellow,
  unstartedRed,
  completedGreen,
} from '../../styles/js/shared';

class TeamMembersListItem extends Component {
  state = {
    dialogOpen: false,
    mode: null,
  };

  canEditRole = () => {
    const { isEditing, teamUser } = this.props;
    const context = new CheckContext(this).getContextStore();
    const { currentUser } = context;
    return isEditing && teamUser.node.status === 'member' && (currentUser.is_admin || teamUser.node.user_id !== currentUser.dbid);
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
    const userIsSelf = teamUser.node.user_id === currentUser.dbid;
    this.setState({ dialogOpen: true, mode: userIsSelf ? 'leave' : 'remove' });
  };

  fail = (transaction) => {
    const fallbackMessage = this.props.intl.formatMessage(globalStrings.unknownError, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    const message = getErrorMessage(transaction, fallbackMessage);
    this.context.setMessage(message);
  };

  handleDeleteTeamUser() {
    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
        id: this.props.teamUser.node.id,
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
        id: this.props.teamUser.node.id,
        team: this.props.teamUser.node.team,
        status,
      }),
      { onFailure: this.fail },
    );
  }

  submitRoleChange = () => {
    Relay.Store.commitUpdate(
      new UpdateTeamUserMutation({
        id: this.props.teamUser.node.id,
        role: this.state.role,
      }),
      { onFailure: this.fail },
    );
    this.setState({ role: null, dialogOpen: false });
  };

  renderConfirmDialog = () => {
    const { teamUser } = this.props;

    const titles = {
      leave: <FormattedMessage
        id="TeamMembersListItem.confirmLeaveTitle"
        defaultMessage="Are you sure you want to leave {team}?"
        values={{ team: teamUser.node.team.name }}
      />,
      remove: <FormattedMessage
        id="TeamMembersListItem.confirmDeleteMemberTitle"
        defaultMessage="Are you sure you want to remove {user}?"
        values={{ user: teamUser.node.user.name }}
      />,
      edit_role: <FormattedMessage
        id="TeamMembersListItem.confirmEditMemberTitle"
        defaultMessage="Are you sure you want to change {user}'s role?"
        values={{ user: teamUser.node.user.name }}
      />,
    };

    const blurbs = {
      leave: <FormattedMessage
        id="TeamMembersListItem.confirmLeaveBlurb"
        defaultMessage="You will be removed from {team}"
        values={{ team: teamUser.node.team.name }}
      />,
      remove: <FormattedMessage
        id="TeamMembersListItem.confirmDeleteMemberBlurb"
        defaultMessage="User will be removed from {team}"
        values={{ team: teamUser.node.team.name }}
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
    const { teamUser, isEditing, singleOwner } = this.props;
    const userIsSelf = teamUser.node.user_id === currentUser.dbid;
    const selfIsOwner = userIsSelf && teamUser.node.role === 'owner';

    const assignmentsProgress = teamUser.node.assignments_progress;
    let assignmentsProgressColor = null;
    if (assignmentsProgress) {
      assignmentsProgressColor = inProgressYellow;
      if (assignmentsProgress.in_progress === 0 &&
          assignmentsProgress.completed === 0 &&
          assignmentsProgress.unstarted > 0) {
        assignmentsProgressColor = unstartedRed;
      }
      if (assignmentsProgress.in_progress === 0 &&
          assignmentsProgress.completed > 0 &&
          assignmentsProgress.unstarted === 0) {
        assignmentsProgressColor = completedGreen;
      }
    }

    let deleteTooltip = <FormattedMessage id="TeamMembersListItem.deleteMember" defaultMessage="Remove member" />;

    if (userIsSelf) {
      deleteTooltip = <FormattedMessage id="TeamMembersListItem.leaveTeam" defaultMessage="Leave workspace" />;

      if (selfIsOwner && singleOwner) {
        deleteTooltip = <FormattedMessage id="TeamMembersListItem.singleOwner" defaultMessage="Before you can leave the workspace, please assign ownership to another member." />;
      }
    }

    return (
      <ListItem
        className="team-members__member"
        key={teamUser.node.id}
        disabled
      >
        <FlexRow>
          <FlexRow>
            <RCTooltip
              placement="top"
              overlay={<UserTooltip user={teamUser.node.user} team={teamUser.node.team} />}
            >
              <Link to={`/check/user/${teamUser.node.user.dbid}`} className="team-members__profile-link">
                <FlexRow>
                  <Offset isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}>
                    <SourcePicture
                      className="avatar"
                      object={teamUser.node.user.source}
                      alt={teamUser.node.user.name}
                      size="small"
                      type="user"
                    />
                  </Offset>
                  <Text breakWord>
                    {teamUser.node.user.name}<br />
                    { assignmentsProgress.completed === 0 &&
                      assignmentsProgress.in_progress === 0 &&
                      assignmentsProgress.unstarted === 0 ? null :
                      <span style={{ fontSize: 11, color: assignmentsProgressColor }}>
                        <FormattedMessage
                          id="teamMembersListItem.assignmentsProgress"
                          defaultMessage="{completedCount} completed, {inProgressCount} in progress, {unstartedCount} unstarted"
                          values={{
                            completedCount: assignmentsProgress.completed,
                            inProgressCount: assignmentsProgress.in_progress,
                            unstartedCount: assignmentsProgress.unstarted,
                          }}
                        />
                      </span>
                    }
                  </Text>
                </FlexRow>
              </Link>
            </RCTooltip>
          </FlexRow>

          {(() => {
            if (this.props.requestingMembership) {
              return (
                <FlexRow>
                  <RaisedButton
                    style={buttonInButtonGroupStyle}
                    onClick={this.handleTeamMembershipRequest.bind(this, 'member')}
                    className="team-member-requests__user-button--approve"
                    label={
                      <FormattedMessage
                        id="TeamMembershipRequestsListItem.approve"
                        defaultMessage="Approve"
                      />
                    }
                  />
                  <RaisedButton
                    onClick={this.handleTeamMembershipRequest.bind(this, 'banned')}
                    className="team-member-requests__user-button--deny"
                    label={
                      <FormattedMessage id="TeamMembershipRequestsListItem.deny" defaultMessage="Reject" />
                    }
                  />
                </FlexRow>
              );
            }
            return (
              <FlexRow>
                <RoleSelect
                  onChange={this.handleRoleChange}
                  value={teamUser.node.role}
                  disabled={!this.canEditRole()}
                />

                {isEditing && teamUser.node.status !== 'banned' ?
                  <Tooltip title={deleteTooltip}>
                    <div>
                      <IconButton
                        disabled={singleOwner && userIsSelf && selfIsOwner}
                        className="team-members__delete-member"
                        onClick={this.handleDeleteButtonClick}
                      >
                        <MdClear />
                      </IconButton>
                    </div>
                  </Tooltip>
                  : null}
              </FlexRow>
            );
          })()}

        </FlexRow>
        { this.renderConfirmDialog() }
      </ListItem>
    );
  }
}

TeamMembersListItem.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

TeamMembersListItem.contextTypes = {
  setMessage: PropTypes.func,
  store: PropTypes.object,
};

export default injectIntl(TeamMembersListItem);
