import Relay from 'react-relay';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, intlShape, injectIntl } from 'react-intl';
import KeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right';
import config from 'config';
import { Link } from 'react-router';
import { Card, CardActions, CardText, CardHeader } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import { List, ListItem } from 'material-ui/List';
import Avatar from 'material-ui/Avatar';
import {
  alertRed,
  highlightBlue,
  checkBlue,
  defaultBorderRadius,
  defaultBorderWidth,
  titleStyle,
  listStyle,
  listItemButtonStyle,
  white,
  black05,
} from '../../styles/js/shared';
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
  getContext() {
    const context = new CheckContext(this);
    return context;
  }

  setCurrentTeam(team, user) {
    const that = this;
    const context = this.getContext();
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
    const user = this.props.user;
    const currentUser = this.getContext().getContextStore().currentUser;
    const teamUsers = this.props.user.team_users.edges;

    const isUserSelf = (user.id === currentUser.id);

    const that = this;
    const otherTeams = [];
    const pendingTeams = [];
    const teamAvatarStyle = {
      border: `${defaultBorderWidth} solid ${black05}`,
      borderRadius: `${defaultBorderRadius}`,
      backgroundColor: white,
    };

    const teamButton = function teamButton(team) {
      if (team.status === 'requested') {
        return (
          <FlatButton
            style={listItemButtonStyle}
            hoverColor={alertRed}
            onClick={that.cancelRequest.bind(this, team)}
          >
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
      return '';
    };

    teamUsers.map((teamUser) => {
      const team = teamUser.node.team;
      const status = teamUser.node.status;
      const visible = !teamUser.node.team.private;

      if (!isUserSelf && !visible) { return; }

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

    const cardTitle = isUserSelf ?
      <FormattedMessage id="teams.yourTeams" defaultMessage="Your Teams" /> :
      <FormattedMessage id="teams.userTeams" defaultMessage="{name} is a member of {number} teams" values={{ name: user.name, number: pendingTeams.length + otherTeams.length }} />;

    return (
      <Card>
        <CardHeader
          titleStyle={titleStyle}
          title={cardTitle}
        />
        { (otherTeams.length + pendingTeams.length) ?
          <List className="teams" style={listStyle}>
            {otherTeams.map((team, index) =>
              <ListItem
                key={index}
                hoverColor={highlightBlue}
                focusRippleColor={checkBlue}
                touchRippleColor={checkBlue}
                containerElement={<Link to={buildUrl(team)} />}
                leftAvatar={<Avatar style={teamAvatarStyle} src={team.avatar} />}
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
                leftAvatar={<Avatar style={teamAvatarStyle} src={team.avatar} />}
                primaryText={team.name}
                rightIconButton={teamButton(team)}
                secondaryText={that.requestedToJoinString()}
              />,
            )}
          </List> : <CardText><FormattedMessage id="switchTeams.noTeams" defaultMessage="You are not a member of any teams yet." /></CardText>
        }

        { isUserSelf ?
          <CardActions>
            <FlatButton
              label={<FormattedMessage id="switchTeams.newTeamLink" defaultMessage="Create Team" />}
              onClick={() => this.getContext().getContextStore().history.push('/check/teams/new')}
            />
          </CardActions> : null
        }
      </Card>
    );
  }
}

SwitchTeamsComponent.propTypes = {
  intl: intlShape.isRequired,
  user: PropTypes.object.isRequired,
};

SwitchTeamsComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(SwitchTeamsComponent);
