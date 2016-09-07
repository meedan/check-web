import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import MeRoute from '../../relay/MeRoute';
import SwitchTeams from './SwitchTeams.js'

class TeamsComponent extends Component {
  render() {
    var currentTeam = this.props.me.current_team;

    var otherTeams = [
      // TODO
    ];
    var pendingTeams = [
      // TODO
    ];

    return (
      <section className='teams'>
        <div className='teams__content'>
          <h2 className='teams__main-heading'>Your Teams</h2>
          <SwitchTeams currentTeam={currentTeam} otherTeams={otherTeams} pendingTeams={pendingTeams} />
        </div>
      </section>
    );
  }
}

const TeamsContainer = Relay.createContainer(TeamsComponent, {
  fragments: {
    me: () => Relay.QL`
      fragment on User {
        current_team {
          id,
          name,
          avatar,
          members_count
        }
      }
    `
  }
});

class Teams extends Component {
  render() {
    var route = new MeRoute();
    return (<Relay.RootContainer Component={TeamsContainer} route={route} />);
  }
}

export default Teams;
