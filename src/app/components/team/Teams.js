import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import MeRoute from '../../relay/MeRoute';
import SwitchTeams from './SwitchTeams.js'

class TeamsComponent extends Component {
  render() {
    var currentTeam = this.props.me.current_team;

    // TODO: use real data
    var otherTeams = [
      {
        name: 'ProPublica',
        avatar: 'https://pbs.twimg.com/profile_images/660147326091182081/Q4TLW_Fe.jpg',
        url: '/team/2',
        membersCount: 10
      }
    ];
    var pendingTeams = [
      {
        name: 'Bellingcat',
        avatar: 'https://pbs.twimg.com/profile_images/615058568300097536/WpTJfNg3.png',
        url: '/team/3',
      }
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
