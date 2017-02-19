import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import MeRoute from '../../relay/MeRoute';
import userFragment from '../../relay/userFragment';
import UpdateUserMutation from '../../relay/UpdateUserMutation';
import DeleteTeamUserMutation from '../../relay/DeleteTeamUserMutation';
import CheckContext from '../../CheckContext';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import MdChevronRight from 'react-icons/lib/md/chevron-right';
import { Link } from 'react-router';
import config from 'config';

const messages = defineMessages({
  switchTeamsError: {
    id: 'switchTeams.error',
    defaultMessage: 'Sorry, could not switch teams'
  }
});

class SwitchTeamsComponent extends Component {
  membersCountString(count) {
    if (typeof count === 'number') {
      return `${count.toString()} member${count === 1 ? '' : 's'}`;
    }
  }

  cancelRequest(team) {
    Relay.Store.commitUpdate(
      new DeleteTeamUserMutation({
        id: team.team_user_id,
      }),
    );
  }

  setCurrentTeam(team, user) {
    const context = new CheckContext(this);
    const history = context.getContextStore().history;

    const currentUser = context.getContextStore().currentUser;
    currentUser.current_team = team;
    context.setContextStore({ team, currentUser });

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.switchTeamsError);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
      window.alert(message);
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

  render() {
    const currentUser = this.props.me;
    const currentTeam = this.props.me.current_team;
    const team_users = this.props.me.team_users.edges;
    const that = this;
    const otherTeams = [];
    const pendingTeams = [];

    team_users.map((team_user) => {
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

    const buildUrl = function (team) { return `${window.location.protocol}//${config.selfHost}/${team.slug}`; };

    return (
      <div className="switch-teams">
        <ul className="switch-teams__teams">

          {(() => {
            if (currentTeam) {
              return (
                <li className="switch-teams__team switch-teams__team--current">
                  <a href={buildUrl(currentTeam)} className="switch-teams__team-link">
                    <div className="switch-teams__team-avatar" style={{ 'background-image': `url(${currentTeam.avatar})` }} />
                    <div className="switch-teams__team-copy">
                      <h3 className="switch-teams__team-name">{currentTeam.name}</h3>
                      <span className="switch-teams__team-members-count">{that.membersCountString(currentTeam.members_count)}</span>
                    </div>
                    <div className="switch-teams__team-actions">
                      <MdChevronRight className="switch-teams__team-caret" />
                    </div>
                  </a>
                </li>
              );
            }
          })()}

          {otherTeams.map(function (team) {
            return (
              <li className="switch-teams__team">
                <div onClick={that.setCurrentTeam.bind(that, team, currentUser)} className="switch-teams__team-link">
                  <div className="switch-teams__team-avatar" style={{ 'background-image': `url(${team.avatar})` }} />
                  <div className="switch-teams__team-copy">
                    <h3 className="switch-teams__team-name">{team.name}</h3>
                    <span className="switch-teams__team-members-count">{that.membersCountString(team.members_count)}</span>
                  </div>
                  <div className="switch-teams__team-actions">
                    <MdChevronRight className="switch-teams__team-caret" />
                  </div>
                </div>
              </li>
            );
          })}

          {pendingTeams.map(function (team) {
            return (
              <li className="switch-teams__team switch-teams__team--pending">
                <div className="switch-teams__team-avatar" style={{ 'background-image': `url(${team.avatar})` }} />
                <div className="switch-teams__team-copy">
                  <h3 className="switch-teams__team-name"><a href={buildUrl(team)}>{team.name}</a></h3>
                  <span className="switch-teams__team-join-request-message">
                    <FormattedMessage id="switchTeams.joinRequestMessage" defaultMessage="You requested to join" />
                  </span>
                </div>
                <div className="switch-teams__team-actions">
                  {(() => {
                    if (team.status === 'requested') {
                      return (<button className="switch-teams__cancel-join-request" onClick={that.cancelRequest.bind(this, team)}>
                        <FormattedMessage id="switchTeams.cancelJoinRequest" defaultMessage="Cancel" />
                      </button>);
                    } else if (team.status === 'banned') {
                      return (<FormattedMessage id="switchTeams.bannedJoinRequest" defaultMessage="Cancelled" />);
                    }
                  })()}
                </div>
              </li>
            );
          })}
        </ul>

        <Link to="/check/teams/new" className="switch-teams__new-team-link"><FormattedMessage id="switchTeams.newTeamLink" defaultMessage="+ New team" /></Link>
      </div>
    );
  }
}

SwitchTeamsComponent.propTypes = {
  intl: intlShape.isRequired
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
    return (<Relay.RootContainer Component={SwitchTeamsContainer} route={route} forceFetch />);
  }
}

export default SwitchTeams;
