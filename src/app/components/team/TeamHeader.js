import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import TeamRoute from '../../relay/TeamRoute';
import teamFragment from '../../relay/teamFragment';
import CheckContext from '../../CheckContext';
import ProjectList from '../project/ProjectList';

class TeamHeaderComponent extends Component {
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
        <Link to="/" className="team-header__clickable" title={team.name}>
          <div className="team-header__avatar" style={{ backgroundImage: `url(${team.avatar})` }}></div>
        </Link>
        <div className="team-header__copy">
          <h3 className="team-header__name">
            {team.name}
            <i className="team-header__caret / fa fa-chevron-down" aria-hidden="true"></i>
          </h3>
          <div className="team-header__project-list">
            <ProjectList team={team} />
          </div>
        </div>
      </nav>
    );
  }
}

TeamHeaderComponent.contextTypes = {
  store: React.PropTypes.object,
};

const TeamHeaderContainer = Relay.createContainer(TeamHeaderComponent, {
  fragments: {
    team: () => teamFragment,
  },
});

class TeamHeader extends Component {
  render() {
    const route = new TeamRoute({ teamId: '' });
    return (<Relay.RootContainer Component={TeamHeaderContainer} route={route} />);
  }
}

export default TeamHeader;
