import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import PublicTeamRoute from '../../relay/PublicTeamRoute';
import CheckContext from '../../CheckContext';

class TeamPublicHeaderComponent extends Component {
  updateContext() {
    new CheckContext(this).setContextStore({ team: this.props.team });
  }

  componentWillMount() {
    this.updateContext();
  }

  componentWillUpdate() {
    this.updateContext();
  }

  render() {
    const team = this.props.team;

    return (
      <nav className="team-header">
        <Link to="/check/teams" className="team-header__clickable" title={team.name}>
          <div className="team-header__avatar" style={{ backgroundImage: `url(${team.avatar})` }}></div>
        </Link>
        <div className="team-header__copy">
          <h3 className="team-header__name">
            {team.name}
            <i className="team-header__caret / fa fa-chevron-down" aria-hidden="true"></i>
          </h3>
        </div>
      </nav>
    );
  }
}

TeamPublicHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

const TeamPublicHeaderContainer = Relay.createContainer(TeamPublicHeaderComponent, {
  fragments: {
    team: () => Relay.QL`
      fragment on PublicTeam {
        name,
        avatar,
        dbid,
        slug
      }
    `,
  },
});

class TeamPublicHeader extends Component {
  render() {
    const teamSlug = (this.props.params && this.props.params.team) ? this.props.params.team : '';
    const route = new PublicTeamRoute({ teamSlug });
    return (
      <Relay.RootContainer
        Component={TeamPublicHeaderContainer}
        route={route}
        renderLoading={function() {
          return (
            <nav className="team-header team-header--loading">
              <div className="team-header__avatar"></div>
            </nav>
          );
        }}
      />
    );
  }
}

export default TeamPublicHeader;
