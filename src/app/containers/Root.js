import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import App from './App';
import { IndexComponent, TermsOfService, NotFound, CreateAccount } from '../components';
import { Sources, Source, User, Me } from '../components/source';
import Team  from '../components/team/Team';
import { CreateMedia, Media } from '../components/media';
import TeamMembers  from '../components/team/TeamMembers';
import CreateTeam from '../components/team/CreateTeam'
import JoinTeam from '../components/team/JoinTeam.js';
import Project from '../components/project/Project.js';
import ProjectHeader from '../components/project/ProjectHeader';
import Teams from '../components/team/Teams.js';

export default class Root extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired
  };

  render() {
    const { store } = this.props;
    const history = syncHistoryWithStore(browserHistory, store);
    window.Checkdesk = { history: history, context: {} };

    return (
      <Provider store={store}>
        <Router history={history}>
          <Route path="/" component={App}>
            <IndexRoute component={IndexComponent} />
            <Route path="tos" component={TermsOfService} public={true} />
            <Route path="team/:teamId/sources" component={Sources} />
            <Route path="team/:teamId/sources/new" component={CreateAccount} />
            <Route path="team/:teamId/source/:sourceId" component={Source} />
            <Route path="medias/new" component={CreateMedia} />
            <Route path="team/:teamId/project/:projectId/media/:mediaId" component={Media} />
            <Route path="user/:userId" component={User} />
            <Route path="me" component={Me} />
            <Route path="team/:teamId/join" component={JoinTeam} />
            <Route path="team/:teamId/members" component={TeamMembers} />
            <Route path="team/:teamId" component={Team} />
            <Route path="teams/new" component={CreateTeam} fullscreen={true} />
            <Route path="teams" component={Teams} fullscreen={true} />
            <Route path="team/:teamId/project/:projectId" component={Project} />
            <Route path="*" component={NotFound} public={true} />
          </Route>
        </Router>
      </Provider>
    );
  }
}
