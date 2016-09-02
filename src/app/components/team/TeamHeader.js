import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import MeRoute from '../../relay/MeRoute';

class TeamHeaderComponent extends Component {
  render() {
    var currentTeam = this.props.me.current_team;

    return (
      <nav className='team-header'>
        {(() => {
          if (currentTeam) {
            return (
              <Link to={'/team/' + currentTeam.dbid} className='team-header__clickable'>
                <div className='team-header__icon'>
                  <FontAwesome className='team-header__caret' name='angle-left' />
                </div>
                <div className='team-header__avatar' style={{'background-image': 'url(' + currentTeam.avatar + ')'}}></div>
                <div className='team-header__copy'>
                  <h3 className='team-header__name'>{currentTeam.name}</h3>
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
    me: () => Relay.QL`
      fragment on User {
        current_team {
          dbid,
          name,
          avatar
        }
      }
    `
  }
});

class TeamHeader extends Component {
  render() {
    var route = new MeRoute();
    return (<Relay.RootContainer Component={TeamHeaderContainer} route={route} />);
  }
}

export default TeamHeader;
