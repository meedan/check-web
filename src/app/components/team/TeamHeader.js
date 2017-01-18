import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import Pusher from 'pusher-js';
import TeamRoute from '../../relay/TeamRoute';
import teamFragment from '../../relay/teamFragment';
import CheckContext from '../../CheckContext';
import ProjectList from '../project/ProjectList';

class TeamHeaderComponent extends Component {
  getPusher() {
    const context = new CheckContext(this);
    return context.getContextStore().pusher;
  }

  updateContext() {
    new CheckContext(this).setContextStore({ team: this.props.team });
  }

  componentWillMount() {
    this.updateContext();
  }

  componentWillUpdate() {
    this.updateContext();
  }

  subscribe() {
    const pusher = this.getPusher();
    if (pusher) {
      const that = this;
      pusher.subscribe(this.props.team.pusher_channel).bind('project_created', (data) => {
        that.props.relay.forceFetch();
      });
    }
  }

  componentDidMount() {
    this.subscribe();
  }

  unsubscribe() {
    const pusher = this.getPusher();
    if (pusher) {
      pusher.unsubscribe(this.props.team.pusher_channel);
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
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
    return (
      <Relay.RootContainer
        Component={TeamHeaderContainer}
        route={route}
        renderLoading={function() {
          return (
            <nav className="team-header team-header--loading">
              <Link to="/" className="team-header__clickable" title='Back to team'>
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
