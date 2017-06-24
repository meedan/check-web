import React, {Component, PropTypes} from 'react';
import Relay from 'react-relay';
import MeRoute from '../../relay/MeRoute';
import userFragment from '../../relay/userFragment';
import UpdateUserMutation from '../../relay/UpdateUserMutation';
import DeleteTeamUserMutation from '../../relay/DeleteTeamUserMutation';
import CheckContext from '../../CheckContext';
import {FormattedMessage, defineMessages, injectIntl, intlShape} from 'react-intl';
import MdChevronRight from 'react-icons/lib/md/chevron-right';
import {Link} from 'react-router';
import config from 'config';
import {Card, CardActions, CardHeader, CardTitle, CardText} from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import {List, ListItem} from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import styled from 'styled-components';
import {
  alertRed,
  checkBlue,
  black05,
  highlightBlue,
  avatarStyle,
  titleStyle,
  listItemStyle,
  listStyle,
  listItemButtonStyle
} from '../../../../config-styles';

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
  membersCountString(count) {
    if (typeof count === 'number') {
      return `${count.toString()} ${count === 1
        ? this.props.intl.formatMessage(messages.switchTeamsMember)
        : this.props.intl.formatMessage(messages.switchTeamsMembers)}`;
    }
  }

  requestedToJoinString() {
    return `${this.props.intl.formatMessage(messages.joinTeam)}`;
  }

  cancelRequest(team) {
    Relay.Store.commitUpdate(
      new DeleteTeamUserMutation({
        id: team.team_user_id,
      })
    );
  }

  setCurrentTeam(team, user) {
    const that = this;
    const context = new CheckContext(this);
    const history = context.getContextStore().history;

    const currentUser = context.getContextStore().currentUser;
    currentUser.current_team = team;
    context.setContextStore({team, currentUser});

    const onFailure = transaction => {
      const error = transaction.getError();
      let message = that.props.intl.formatMessage(messages.switchTeamsError);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) {}
    };

    const onSuccess = response => {
      const path = `/${team.slug}`;
      history.push(path);
    };

    Relay.Store.commitUpdate(
      new UpdateUserMutation({
        current_team_id: team.dbid,
        current_user_id: user.id,
      }),
      {onSuccess, onFailure}
    );
  }

  render() {
    const currentUser = this.props.me;
    const currentTeam = this.props.me.current_team;
    const team_users = this.props.me.team_users.edges;
    const that = this;
    const otherTeams = [];
    const pendingTeams = [];

    const teamButton = function(team) {
      if (team.status === 'requested') {
        return (
          <FlatButton style={listItemButtonStyle} hoverColor={alertRed} onClick={that.cancelRequest.bind(this, team)}>
            <FormattedMessage id="switchTeams.cancelJoinRequest" defaultMessage="Cancel" />
          </FlatButton>
        );
      } else if (team.status === 'banned') {
        return (
          <FlatButton style={listItemButtonStyle} disabled>
            <FormattedMessage id="switchTeams.bannedJoinRequest" defaultMessage="Cancelled" />
          </FlatButton>
        );
      }
    };

    team_users.map(team_user => {
      const team = team_user.node.team;
      if (team.dbid != currentTeam.dbid) {
        const status = team_user.node.status;
        if (status === 'requested' || status === 'banned') {
          team.status = status;
          team.team_user_id = team_user.node.id;
          pendingTeams.push(team);
        } else {
          otherTeams.push(team);
        }
      }
    });

    const buildUrl = function(team) {
      return `${window.location.protocol}//${config.selfHost}/${team.slug}`;
    };

    return (
      <Card>
        <CardHeader
          titleStyle={titleStyle}
          title={<FormattedMessage id="teams.yourTeams" defaultMessage="Your Teams" />}
        />
        <List style={listStyle}>
          {(() => {
            if (currentTeam) {
              return (
                <ListItem
                  style={listItemStyle}
                  hoverColor={highlightBlue}
                  href={buildUrl(currentTeam)}
                  leftAvatar={<Avatar style={avatarStyle} src={currentTeam.avatar} />}
                  primaryText={currentTeam.name}
                  rightIcon={<MdChevronRight />}
                  secondaryText={that.membersCountString(currentTeam.members_count)}
                />
              );
            }
          })()}

          {otherTeams.map(team =>
            <ListItem
              style={listItemStyle}
              hoverColor={highlightBlue}
              href={buildUrl(team)}
              leftAvatar={<Avatar style={avatarStyle} src={team.avatar} />}
              onClick={that.setCurrentTeam.bind(that, team, currentUser)}
              primaryText={team.name}
              rightIcon={<MdChevronRight />}
              secondaryText={that.membersCountString(team.members_count)}
            />
          )}

          {pendingTeams.map(function(team) {
            return (
              <ListItem
                style={listItemStyle}
                hoverColor={highlightBlue}
                href={buildUrl(team)}
                leftAvatar={<Avatar style={avatarStyle} src={team.avatar} />}
                primaryText={team.name}
                rightIconButton={teamButton(team)}
                secondaryText={that.requestedToJoinString()}
              />
            );
          })}
        </List>
        <CardActions>
          <FlatButton href="/check/teams/new">
            <FormattedMessage id="switchTeams.newTeamLink" defaultMessage="+ New team" />
          </FlatButton>
        </CardActions>
      </Card>
    );
  }
}

SwitchTeamsComponent.propTypes = {
  intl: intlShape.isRequired,
};

SwitchTeamsComponent.contextTypes = {
  store: React.PropTypes.object,
};

const SwitchTeamsContainer = Relay.createContainer(injectIntl(SwitchTeamsComponent), {
  fragments: {
    me: () => userFragment,
  },
});

class SwitchTeams extends Component {
  render() {
    const route = new MeRoute();
    return <Relay.RootContainer Component={SwitchTeamsContainer} route={route} forceFetch />;
  }
}

export default SwitchTeams;
