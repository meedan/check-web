import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import MeRoute from '../../relay/MeRoute';

class SwitchTeams extends Component {
  render() {
    var currentTeam = this.props.currentTeam;
    var otherTeams = this.props.otherTeams;
    var pendingTeams = this.props.pendingTeams;

    function membersCountString(count) {
      if (typeof count === 'number') {
        return count.toString() + ' member' + (count === 1 ? '' : 's');
      }
    }

    return (
      <div className='switch-teams'>
        <ul className='switch-teams__teams'>

          {(() => {
            if (currentTeam) {
              return (
                <li className='switch-teams__team switch-teams__team--current'>
                  <Link to={'/team/' + currentTeam.dbid} className='switch-teams__team-link'>
                    <div className='switch-teams__team-avatar' style={{'background-image': 'url(' + currentTeam.avatar + ')'}}></div>
                    <div className='switch-teams__team-copy'>
                      <h3 className='switch-teams__team-name'>{currentTeam.name}</h3>
                      <span className='switch-teams__team-members-count'>{membersCountString(currentTeam.members_count)}</span>
                    </div>
                    <div className='switch-teams__team-actions'>
                      <FontAwesome className='switch-teams__team-caret' name='angle-right' />
                    </div>
                  </Link>
                </li>
              );
            }
          })()}

          {otherTeams.map(function(team) {
            return (
              <li className='switch-teams__team'>
                <Link to={team.url} className='switch-teams__team-link'>
                  <div className='switch-teams__team-avatar' style={{'background-image': 'url(' + team.avatar + ')'}}></div>
                  <div className='switch-teams__team-copy'>
                    <h3 className='switch-teams__team-name'>{team.name}</h3>
                    <span className='switch-teams__team-members-count'>{membersCountString(team.membersCount)}</span>
                  </div>
                  <div className='switch-teams__team-actions'>
                    <FontAwesome className='switch-teams__team-caret' name='angle-right' />
                  </div>
                </Link>
              </li>
            );
          })}

          {pendingTeams.map(function(team) {
            return (
              <li className='switch-teams__team switch-teams__team--pending'>
                <div className='switch-teams__team-avatar' style={{'background-image': 'url(' + team.avatar + ')'}}></div>
                <div className='switch-teams__team-copy'>
                  <h3 className='switch-teams__team-name'><Link to={team.url}>{team.name}</Link></h3>
                  <span className='switch-teams__team-join-request-message'>You requested to join</span>
                </div>
                <div className='switch-teams__team-actions'>
                  <button className='switch-teams__cancel-join-request'>Cancel</button>
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

export default SwitchTeams;
