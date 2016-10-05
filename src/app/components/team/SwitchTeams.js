import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import MeRoute from '../../relay/MeRoute';
import userFragment from '../../relay/userFragment';
import UpdateUserMutation from '../../relay/UpdateUserMutation';
import DeleteTeamUserMutation from '../../relay/DeleteTeamUserMutation';
import FontAwesome from 'react-fontawesome';
import { Link } from 'react-router';
import config from 'config';

class SwitchTeamsComponent extends Component {
  membersCountString(count) {
    if (typeof count === 'number') {
      return count.toString() + ' member' + (count === 1 ? '' : 's');
    }
  }

  cancelRequest(team) {
    Relay.Store.commitUpdate(
      new DeleteTeamUserMutation({
        id: team.team_user_id
      })
    );
  }

  setCurrentTeam(team) {
    var onFailure = (transaction) => {
      transaction.getError().json().then(function(json) {
        var message = 'Sorry, could not switch teams';
        if (json.error) {
          message = json.error;
        }
        window.alert(message);
      });
    };

    var onSuccess = (response) => {
      window.location.href = window.location.protocol + '//' + team.subdomain + '.' + config.selfHost;
    };

    Relay.Store.commitUpdate(
      new UpdateUserMutation({
        current_team_id: team.dbid
      }),
      { onSuccess, onFailure }
    );
  }

  render() {
    const currentTeam = this.props.me.current_team;
    const team_users = this.props.me.team_users.edges;
    const that = this;
    var otherTeams = [];
    var pendingTeams = [];

    team_users.map((team_user) => {
      var team = team_user.node.team;
      if (team.dbid != currentTeam.dbid) {
        var status = team_user.node.status;
        if (status === 'requested' || status === 'banned') {
          team.status = status;
          team.team_user_id = team_user.node.id;
          pendingTeams.push(team);
        }
        else {
          otherTeams.push(team);
        }
      }
    });

    const buildUrl = function(team) { return window.location.protocol + '//' + team.subdomain + '.' + config.selfHost };

    return (
      <div className='switch-teams'>
        <ul className='switch-teams__teams'>

          {(() => {
            if (currentTeam) {
              return (
                <li className='switch-teams__team switch-teams__team--current'>
                  <a href={buildUrl(currentTeam)} className='switch-teams__team-link'>
                    <div className='switch-teams__team-avatar' style={{'background-image': 'url(' + currentTeam.avatar + ')'}}></div>
                    <div className='switch-teams__team-copy'>
                      <h3 className='switch-teams__team-name'>{currentTeam.name}</h3>
                      <span className='switch-teams__team-members-count'>{that.membersCountString(currentTeam.members_count)}</span>
                    </div>
                    <div className='switch-teams__team-actions'>
                      <FontAwesome className='switch-teams__team-caret' name='angle-right' />
                    </div>
                  </a>
                </li>
              );
            }
          })()}

          {otherTeams.map(function(team) {
            return (
              <li className='switch-teams__team'>
                <div onClick={that.setCurrentTeam.bind(this, team)} className='switch-teams__team-link'>
                  <div className='switch-teams__team-avatar' style={{'background-image': 'url(' + team.avatar + ')'}}></div>
                  <div className='switch-teams__team-copy'>
                    <h3 className='switch-teams__team-name'>{team.name}</h3>
                    <span className='switch-teams__team-members-count'>{that.membersCountString(team.members_count)}</span>
                  </div>
                  <div className='switch-teams__team-actions'>
                    <FontAwesome className='switch-teams__team-caret' name='angle-right' />
                  </div>
                </div>
              </li>
            );
          })}

          {pendingTeams.map(function(team) {
            return (
              <li className='switch-teams__team switch-teams__team--pending'>
                <div className='switch-teams__team-avatar' style={{'background-image': 'url(' + team.avatar + ')'}}></div>
                <div className='switch-teams__team-copy'>
                  <h3 className='switch-teams__team-name'><a href={buildUrl(team)}>{team.name}</a></h3>
                  <span className='switch-teams__team-join-request-message'>You requested to join</span>
                </div>
                <div className='switch-teams__team-actions'>
                  {(() => {
                    if (team.status === 'requested') {
                      return (<button className='switch-teams__cancel-join-request' onClick={that.cancelRequest.bind(this, team)}>Cancel</button>);
                    }
                    else if (team.status === 'banned') {
                      return (<span>Cancelled</span>);
                    }
                  })()}
                </div>
              </li>
            );
          })}
        </ul>

        <Link to='/teams/new' className='switch-teams__new-team-link'>+ New team</Link>
      </div>
    );
  }
}

const SwitchTeamsContainer = Relay.createContainer(SwitchTeamsComponent, {
  fragments: {
    me: () => userFragment
  }
});

class SwitchTeams extends Component {
  render() {
    var route = new MeRoute();
    return (<Relay.RootContainer Component={SwitchTeamsContainer} route={route} forceFetch={true} />);
  }
}

export default SwitchTeams;
