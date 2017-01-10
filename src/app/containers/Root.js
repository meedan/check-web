import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import ReactGA from 'react-ga';
import App from './App';
import { IndexComponent, TermsOfService, NotFound, CreateAccount, AccessDenied, PrivacyPolicy, UserConfirmed, UserUnconfirmed } from '../components';
import { Sources, Source, User, Me } from '../components/source';
import Team from '../components/team/Team';
import { CreateMedia, Media } from '../components/media';
import TeamMembers from '../components/team/TeamMembers';
import CreateTeam from '../components/team/CreateTeam';
import JoinTeam from '../components/team/JoinTeam.js';
import Project from '../components/project/Project.js';
import ProjectHeader from '../components/project/ProjectHeader';
import Teams from '../components/team/Teams.js';
import Search from '../components/Search.js';
import CheckContext from '../CheckContext';
import config from 'config';

export default class Root extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
  };

  getContext() {
    const context = new CheckContext(this);
    return context;
  }

  setStore() {
    const history = syncHistoryWithStore(browserHistory, this.props.store);
    const context = this.getContext();
    const store = context.store || this.props.store;

    const data = { history };

    if (config.pusherKey) {
      Pusher.logToConsole = !!config.pusherDebug;
      const pusher = new Pusher(config.pusherKey, { encrypted: true });
      data.pusher = pusher;
    }

    context.setContextStore(data, store);
    this.setState(data);
  }

  componentWillMount() {
    this.setStore();
  }

  componentWillUpdate() {
    this.setStore();
  }

  componentDidMount() {
    if (config.googleAnalyticsCode) {
      ReactGA.initialize(config.googleAnalyticsCode, { debug: false });
    }
  }

  logPageView() {
    if (config.googleAnalyticsCode) {
      ReactGA.set({ page: window.location.pathname });
      ReactGA.pageview(window.location.pathname);
    }
  }

  render() {
    const { store } = this.props;
    window.Checkdesk = { store };

    return (
      <Provider store={store}>
        <Router history={this.state.history} onUpdate={this.logPageView.bind(this)}>
          <Route path="/" component={App}>
            <IndexRoute component={Team} />
            <Route path="tos" component={TermsOfService} public />
            <Route path="privacy" component={PrivacyPolicy} public />
            <Route path="sources" component={Sources} />
            <Route path="sources/new" component={CreateAccount} />
            <Route path="source/:sourceId" component={Source} />
            <Route path="medias/new" component={CreateMedia} />
            <Route path="project/:projectId/media/:mediaId" component={Media} />
            <Route path="user/confirmed" component={UserConfirmed} public />
            <Route path="user/unconfirmed" component={UserUnconfirmed} public />
            <Route path="user/:userId" component={User} />
            <Route path="me" component={Me} />
            <Route path="join" component={JoinTeam} />
            <Route path="members" component={TeamMembers} />
            <Route path="teams/new" component={CreateTeam} />
            <Route path="teams" component={Teams} />
            <Route path="project/:projectId" component={Project} />
            <Route path="search(/:query)" component={Search} />
            <Route path="forbidden" component={AccessDenied} public />
            <Route path="*" component={NotFound} public />
          </Route>
        </Router>
      </Provider>
    );
  }
}

Root.contextTypes = {
  store: React.PropTypes.object,
};
