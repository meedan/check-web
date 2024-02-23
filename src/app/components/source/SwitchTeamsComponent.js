import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import { browserHistory, Link } from 'react-router';
import Button from '@material-ui/core/Button';
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
import UpdateUserMutation from '../../relay/mutations/UpdateUserMutation';
import DeleteTeamUserMutation from '../../relay/mutations/DeleteTeamUserMutation';
import CheckContext from '../../CheckContext';
import { can } from '../Can';
import { getErrorMessage } from '../../helpers';
import { withSetFlashMessage } from '../FlashMessage';
import { stringHelper } from '../../customHelpers';
import KeyboardArrowRight from '../../icons/chevron_right.svg';
import styles from './User.module.css';

class SwitchTeamsComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showCreateTeamDialog: false,
    };
  }

  getContext() {
    return new CheckContext(this);
  }

  setCurrentTeam(team, user) {
    const context = this.getContext();
    const { currentUser } = context.getContextStore();

    currentUser.current_team = team;
    context.setContextStore({ team, currentUser });

    const onFailure = (transaction) => {
      const fallbackMessage = (
        <FormattedMessage
          id="switchTeams.error"
          defaultMessage="Sorry, an error occurred while updating the workspace. Please try again and contact {supportEmail} if the condition persists."
          description="Error message with instructions on how to contact support"
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );
      const message = getErrorMessage(transaction, fallbackMessage);
      this.props.setFlashMessage(message, 'error');
    };

    const onSuccess = () => {
      const path = `/${team.slug}/all-items`;
      browserHistory.push(path);
    };

    Relay.Store.commitUpdate(
      new UpdateUserMutation({
        current_team_id: team.dbid,
        current_user_id: user.id,
      }),
      { onSuccess, onFailure },
    );
  }

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
      border: '1px solid var(--grayDisabledBackground)',
      borderRadius: '2px',
      backgroundColor: 'var(--otherWhite)',
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
              defaultMessage="Workspaces"
              description="Title for user settings area for user workspaces list they are a memeber of"
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
                      style={{ color: 'var(--textPrimary)' }}
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
                      <Button
                        className="switch-team__cancel-request"
                        onClick={this.cancelRequest.bind(this, team)}
                      >
                        <FormattedMessage id="switchTeams.cancelJoinRequest" defaultMessage="Cancel" description="Button label to cancel a request to join a workspace" />
                      </Button>
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

SwitchTeamsComponent.propTypes = {
  user: PropTypes.object.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

SwitchTeamsComponent.contextTypes = {
  store: PropTypes.object,
};

export default withSetFlashMessage(SwitchTeamsComponent);
