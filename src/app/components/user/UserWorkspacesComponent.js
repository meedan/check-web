import React, { Component } from 'react';
// todo switch from classic
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Avatar from '@material-ui/core/Avatar';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import cx from 'classnames/bind';
import BlankState from '../layout/BlankState';
import SettingsHeader from '../team/SettingsHeader';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import CreateTeamDialog from '../team/CreateTeamDialog';
// todo: deprecate these? rely on relay/classic
import UpdateUserMutation from '../../relay/mutations/UpdateUserMutation';
import DeleteTeamUserMutation from '../../relay/mutations/DeleteTeamUserMutation';
import CheckContext from '../../CheckContext';
import { can } from '../Can';
// todo: use updated error handling

import { FlashMessageSetterContext } from '../FlashMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import { stringHelper } from '../../customHelpers';
import KeyboardArrowRight from '../../icons/chevron_right.svg';
import styles from './user.module.css';

// todo apply hooks
const UserWorkspacesComponent = () => {
  const [showCreateTeamDialog, setShowCreateTeamDialog] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const onFailure = (errors) => {
    const errorMessage = getErrorMessageForRelayModernProblem(errors) || <FormattedMessage
      id="switchTeams.error"
      defaultMessage="Sorry, an error occurred while updating the workspace. Please try again and contact {supportEmail} if the condition persists."
      description="Error message with instructions on how to contact support"
      values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
    />;
    setSaving(false);
    setFlashMessage(errorMessage, 'error');
  }

  const onSuccess = () => {
    const path = `/${team.slug}/all-items`;
    browserHistory.push(path);
  }

  const setCurrentTeam = (team, user) => {
    Relay.Store.commitUpdate(
      new UpdateUserMutation({
        current_team_id: team.dbid,
        current_user_id: user.id,
      }),
      { onSuccess, onFailure },
    );
  }
  // todo: modernize to concat
  cancelRequest(team, e) {
    Relay.Store.commitUpdate(new DeleteTeamUserMutation({
      id: team.teamUser_id,
      user: this.props.user,
    }));
    e.preventDefault();
  }

  handleCancelCreateTeam() {
    this.setState({ showCreateTeamDialog: false });
  }

  render() {
    const { user, user: { team_users: { edges: teamUsers } } } = this.props;
    const { currentUser } = this.getContext().getContextStore();
    const isUserSelf = (user.id === currentUser.id);
    const joinedTeams = [];
    const pendingTeams = [];

    const teamAvatarStyle = {
      border: '1px solid var(--color-gray-88)',
      borderRadius: '2px',
      backgroundColor: 'var(--color-white-100)',
    };

    teamUsers.forEach((teamUser) => {
      const { team, status } = teamUser.node;

      if (can(team.permissions, 'read Team') || isUserSelf) {
        if (status === 'member') {
          joinedTeams.push(team);
        } else if (isUserSelf && status === 'requested') {
          team.status = status;
          team.teamUser_id = teamUser.node.id;
          pendingTeams.push(team);
        }
      }
    });

    return (
      <>
        <SettingsHeader
          title={
            <FormattedMessage
              id="userSettings.workspacesTitle"
              defaultMessage="Workspaces [{workspacesCount}]"
              description="Title for user settings area for user workspaces list they are a memeber of"
              values={{ workspacesCount: user?.number_of_teams || 0 }}
            />
          }
          actionButton={
            isUserSelf ?
              <ButtonMain
                theme="brand"
                size="default"
                variant="contained"
                onClick={() => this.setState({ showCreateTeamDialog: true })}
                label={
                  <FormattedMessage id="switchTeams.newTeamLink" defaultMessage="Create" description="Button label for initiating creating a new team workspace" />
                }
              /> :
              null
          }
        />
        <div className={styles['user-setting-details-wrapper']}>
          { (joinedTeams.length + pendingTeams.length) ?
            <div className={styles['user-setting-content-container']}>
              <ul className={cx('teams', styles['user-setting-content-list'])}>
                {joinedTeams.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })).map(team => (
                  <ListItem
                    key={team.slug}
                    className="switch-teams__joined-team"
                    onClick={this.setCurrentTeam.bind(this, team, currentUser)}
                    component={Link}
                    to={`/${team.slug}/all-items`}
                    id={`switch-teams__link-to-${team.slug}`}
                  >
                    <ListItemAvatar>
                      <Avatar style={teamAvatarStyle} src={team.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={team.name}
                      style={{ color: 'var(--color-gray-15)' }}
                      secondary={
                        <FormattedMessage
                          id="switchTeams.member"
                          defaultMessage="{membersCount, plural, one {# member} other {# members}}"
                          description="Count of members of a workspace"
                          values={{ membersCount: team.members_count }}
                        />
                      }
                    />
                    <ListItemSecondaryAction>
                      <ButtonMain
                        iconCenter={<KeyboardArrowRight />}
                        theme="text"
                        variant="text"
                        size="default"
                        onClick={this.setCurrentTeam.bind(this, team, currentUser)}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}

                {pendingTeams.map(team => (
                  <ListItem
                    key={team.slug}
                    className="switch-teams__pending-team"
                    component={Link}
                    to={`/${team.slug}`}
                  >
                    <ListItemAvatar>
                      <Avatar style={teamAvatarStyle} src={team.avatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={team.name}
                      secondary={
                        <FormattedMessage
                          id="switchTeams.joinRequestMessage"
                          defaultMessage="You requested to join"
                          description="Status message of a request to join a workspace"
                        />
                      }
                    />
                    <ListItemSecondaryAction>
                      <ButtonMain
                        theme="text"
                        variant="text"
                        size="default"
                        className="switch-team__cancel-request"
                        onClick={this.cancelRequest.bind(this, team)}
                        label={
                          <FormattedMessage id="switchTeams.cancelJoinRequest" defaultMessage="Cancel" description="Button label to cancel a request to join a workspace" />
                        }
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </ul>
            </div> :
            <div className={styles['user-setting-content-container']}>
              <BlankState>
                <FormattedMessage id="switchTeams.noTeams" defaultMessage="Not a member of any workspace." description="Empty message when the user is not a member of a workspace" />
              </BlankState>
            </div>
          }
          { this.state.showCreateTeamDialog ?
            <CreateTeamDialog onDismiss={this.handleCancelCreateTeam.bind(this)} /> :
            null
          }
        </div>
      </>
    );
  }
}

UserWorkspaces.propTypes = {
  id: PropTypes.string.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

UserWorkspaces.contextTypes = {
  store: PropTypes.object,
};
*/

