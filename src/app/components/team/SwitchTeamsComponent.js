import Relay from 'react-relay';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, intlShape } from 'react-intl';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import config from 'config';
import { Card, CardActions, CardHeader } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import { List, ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import {
  alertRed,
  highlightBlue,
  checkBlue,
  defaultborderRadius,
  titleStyle,
  listStyle,
  listItemButtonStyle,
} from '../../styles/js/variables';
import UpdateUserMutation from '../../relay/UpdateUserMutation';
import DeleteTeamUserMutation from '../../relay/DeleteTeamUserMutation';
import CheckContext from '../../CheckContext';

const messages = defineMessages({
  switchTeamsError: {
    id: 'switchTeams.error',
    defaultMessage: 'Sorry, could not switch teams',
  },
  switchTeamsMember: {
    id: 'switchTeams.member',
    defaultMessage: 'member',
  },
  switchTeamsMembers: {
    id: 'switchTeams.members',
    defaultMessage: 'members',
  },
  joinTeam: {
    id: 'switchTeams.joinRequestMessage',
    defaultMessage: 'You requested to join',
  },
});

class SwitchTeamsComponent extends Component {
  setCurrentTeam(team, user) {
    const that = this;
    const context = new CheckContext(this);
    const history = context.getContextStore().history;

    const currentUser = context.getContextStore().currentUser;
    currentUser.current_team = team;
    context.setContextStore({ team, currentUser });

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = that.props.intl.formatMessage(messages.switchTeamsError);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {}
    };

    const onSuccess = (response) => {
      const path = `/${team.slug}`;
      history.push(path);
    };

    Relay.Store.commitUpdate(
      new UpdateUserMutation({
        current_team_id: team.dbid,
        current_user_id: user.id,
      }),
      { onSuccess, onFailure },
    );
  }

  cancelRequest(team) {
    Relay.Store.commitUpdate(
      new DeleteTeamUserMutation({
        id: team.team_user_id,
      }),
    );
  }

  membersCountString(count) {
    if (typeof count === 'number') {
      return `${count.toString()} ${count === 1
        ? this.props.intl.formatMessage(messages.switchTeamsMember)
        : this.props.intl.formatMessage(messages.switchTeamsMembers)}`;
    }
    return '';
  }

  requestedToJoinString() {
    return `${this.props.intl.formatMessage(messages.joinTeam)}`;
  }

  render() {
    const currentUser = this.props.me;
    const teamUsers = this.props.me.team_users.edges;
    const that = this;
    const otherTeams = [];
    const pendingTeams = [];

    const teamButton = function teamButton(team) {
      if (team.status === 'requested') {
        return (
          <FlatButton
            style={listItemButtonStyle}
            hoverColor={alertRed}
            onClick={that.cancelRequest.bind(this, team)}
          >
            <FormattedMessage
              id="switchTeams.cancelJoinRequest"
              defaultMessage="Cancel"
            />
          </FlatButton>
        );
      } else if (team.status === 'banned') {
        return (
          <FlatButton style={listItemButtonStyle} disabled>
            <FormattedMessage
              id="switchTeams.bannedJoinRequest"
              defaultMessage="Cancelled"
            />
          </FlatButton>
        );
      }
      return '';
    };

    teamUsers.map((teamUser) => {
      const team = teamUser.node.team;
      const status = teamUser.node.status;
      if (status === 'requested' || status === 'banned') {
        team.status = status;
        team.teamUser_id = teamUser.node.id;
        return pendingTeams.push(team);
      }
      return otherTeams.push(team);
    });

    const buildUrl = function buildUrl(team) {
      return `${window.location.protocol}//${config.selfHost}/${team.slug}`;
    };

    return (
      <Card>
        <CardHeader
          titleStyle={titleStyle}
          title={
            <FormattedMessage
              id="teams.yourTeams"
              defaultMessage="Your Teams"
            />
          }
        />
        <List className="teams" style={listStyle}>
          {otherTeams.map((team, index) =>
            <ListItem
              className="team"
              key={index}
              hoverColor={highlightBlue}
              focusRippleColor={checkBlue}
              touchRippleColor={checkBlue}
              href={buildUrl(team)}
              leftAvatar={
                <Avatar
                  style={{ borderRadius: defaultborderRadius }}
                  src={team.avatar}
                />
              }
              onClick={that.setCurrentTeam.bind(that, team, currentUser)}
              primaryText={team.name}
              rightIcon={<KeyboardArrowRight />}
              secondaryText={that.membersCountString(team.members_count)}
            />,
          )}

          {pendingTeams.map((team, index) =>
            <ListItem
              key={index}
              hoverColor={highlightBlue}
              focusRippleColor={checkBlue}
              touchRippleColor={checkBlue}
              href={buildUrl(team)}
              leftAvatar={
                <Avatar
                  style={{ borderRadius: defaultborderRadius }}
                  src={team.avatar}
                />
              }
              primaryText={team.name}
              rightIconButton={teamButton(team)}
              secondaryText={that.requestedToJoinString()}
            />,
          )}
        </List>
        <CardActions>
          <FlatButton href="/check/teams/new">
            <FormattedMessage
              id="switchTeams.newTeamLink"
              defaultMessage="+ New team"
            />
          </FlatButton>
        </CardActions>
      </Card>
    );
  }
}

SwitchTeamsComponent.propTypes = {
  intl: intlShape.isRequired,
  me: PropTypes.object.isRequired,
};

SwitchTeamsComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default SwitchTeamsComponent;
