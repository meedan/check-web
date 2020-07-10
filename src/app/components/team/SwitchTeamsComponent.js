import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { browserHistory, Link } from 'react-router';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import {
  defaultBorderRadius,
  listStyle,
  listItemButtonStyle,
  white,
  black05,
} from '../../styles/js/shared';
import UpdateUserMutation from '../../relay/mutations/UpdateUserMutation';
import DeleteTeamUserMutation from '../../relay/mutations/DeleteTeamUserMutation';
import CheckContext from '../../CheckContext';
import { can } from '../Can';
import { getErrorMessage } from '../../helpers';
import { withSetFlashMessage } from '../FlashMessage';
import { stringHelper } from '../../customHelpers';

class SwitchTeamsComponent extends Component {
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
          values={{ supportEmail: stringHelper('SUPPORT_EMAIL') }}
        />
      );
      const message = getErrorMessage(transaction, fallbackMessage);
      this.props.setFlashMessage(message);
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

  render() {
    const { user, user: { team_users: { edges: teamUsers } } } = this.props;
    const { currentUser } = this.getContext().getContextStore();
    const isUserSelf = (user.id === currentUser.id);
    const joinedTeams = [];
    const pendingTeams = [];

    const teamAvatarStyle = {
      border: `1px solid ${black05}`,
      borderRadius: `${defaultBorderRadius}`,
      backgroundColor: white,
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

    const cardTitle = isUserSelf ?
      <FormattedMessage id="teams.yourTeams" defaultMessage="Your workspaces" /> :
      <FormattedMessage id="teams.userTeams" defaultMessage="{name}'s workspaces" values={{ name: user.name }} />;

    return (
      <Card>
        <CardHeader
          title={cardTitle}
        />
        { (joinedTeams.length + pendingTeams.length) ?
          <List className="teams" style={listStyle}>
            {joinedTeams.map(team => (
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
                  secondary={
                    <FormattedMessage
                      id="switchTeams.member"
                      defaultMessage="{membersCount, plural, =0 {No members} one {1 member} other {# members}}"
                      values={{ membersCount: team.members_count }}
                    />
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={this.setCurrentTeam.bind(this, team, currentUser)}>
                    <KeyboardArrowRight />
                  </IconButton>
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
                    />
                  }
                />
                <ListItemSecondaryAction>
                  <Button
                    className="switch-team__cancel-request"
                    style={listItemButtonStyle}
                    onClick={this.cancelRequest.bind(this, team)}
                  >
                    <FormattedMessage id="switchTeams.cancelJoinRequest" defaultMessage="Cancel" />
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List> :
          <CardContent>
            <FormattedMessage id="switchTeams.noTeams" defaultMessage="Not a member of any workspace." />
          </CardContent>
        }

        { isUserSelf ?
          <CardActions>
            <Button
              onClick={() => browserHistory.push('/check/teams/new')}
            >
              <FormattedMessage id="switchTeams.newTeamLink" defaultMessage="Create Workspace" />
            </Button>
          </CardActions> : null
        }
      </Card>
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
