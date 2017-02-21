import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import TeamRoute from '../../relay/TeamRoute';
import teamFragment from '../../relay/teamFragment';
import TeamHeaderComponent from './TeamHeaderComponent';

const TeamHeaderContainer = Relay.createContainer(TeamHeaderComponent, {
  fragments: {
    team: () => teamFragment,
  },
});

class TeamHeader extends Component {
  render() {
    const teamSlug = (this.props.params && this.props.params.team) ? this.props.params.team : '';
    const route = new TeamRoute({ teamSlug });
    return (
      <Relay.RootContainer
        Component={TeamHeaderContainer}
        route={route}
        renderLoading={function() {
          return (
            <nav className="team-header team-header--loading">
              <Link to={`/${teamSlug}`} className="team-header__clickable">
                <div className="team-header__avatar"></div>
              </Link>
            </nav>
          );
        }}
      />
    );
  }
}

export default TeamHeader;
