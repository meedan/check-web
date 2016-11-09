import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import TeamRoute from '../../relay/TeamRoute';
import teamFragment from '../../relay/teamFragment';
import config from 'config';

class TeamHeaderComponent extends Component {
  render() {
    const team = this.props.team;
    const teamUrl = window.location.protocol + '//' + team.subdomain + '.' + config.selfHost;

    return (
      <nav className='team-header'>
        {(() => {
          if (team) {
            return (
              <Link to='/' className='team-header__clickable'>
                <div className='team-header__icon'>
                  <FontAwesome className='team-header__caret' name='angle-left' />
                </div>
                <div className='team-header__avatar' style={{'background-image': 'url(' + team.avatar + ')'}} title={team.name}></div>
                <div className='team-header__copy'>
                  <h3 className='team-header__name'>{team.name}</h3>
                  <span className='team-header__label'>Team</span>
                </div>
              </Link>
            );
          }
        })()}
      </nav>
    );
  }
}

const TeamHeaderContainer = Relay.createContainer(TeamHeaderComponent, {
  fragments: {
    team: () => teamFragment
  }
});

class TeamHeader extends Component {
  render() {
    var route = new TeamRoute({ teamId: '' });
    return (<Relay.RootContainer Component={TeamHeaderContainer} route={route} />);
  }
}

export default TeamHeader;
