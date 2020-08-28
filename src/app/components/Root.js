import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import ReactGA from 'react-ga';
import { IntlProvider } from 'react-intl';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import Home from './Home';
import RootLocale from './RootLocale';
import NotFound from './NotFound';
import AccessDenied from './AccessDenied';
import UserAlreadyConfirmed from './UserAlreadyConfirmed';
import UserConfirmed from './UserConfirmed';
import UserUnconfirmed from './UserUnconfirmed';
import UserPasswordChange from './UserPasswordChange';
import UserPasswordReset from './UserPasswordReset';
import User from './source/User';
import Me from './source/Me';
import Team from './team/Team';
import AddTeamPage from './team/AddTeamPage';
import JoinTeam from './team/JoinTeam';
import Teams from './team/Teams';
import Trash from './team/Trash';
import MediaPage from './media/MediaPage';
import ReportDesigner from './media/ReportDesigner';
import MediaTasks from './media/MediaTasks';
import Project from './project/Project';
import ProjectEdit from './project/ProjectEdit';
import AllItems from './search/AllItems';
import BotGarden from './BotGarden';
import Bot from './Bot';

class Root extends Component {
  static logPageView() {
    if (config.googleAnalyticsCode) {
      ReactGA.set({ page: window.location.pathname, anonymizeIp: true });
      ReactGA.pageview(window.location.pathname);
    }
  }

  static propTypes = {
    store: PropTypes.object.isRequired,
  };

  // eslint-disable-next-line class-methods-use-this
  componentDidMount() {
    if (config.googleAnalyticsCode) {
      ReactGA.initialize(config.googleAnalyticsCode, { debug: false });
    }
  }

  render() {
    const { store, translations, locale } = this.props;
    window.Check = { store };

    return (
      <React.Fragment>
        <RootLocale locale={locale} />
        <IntlProvider locale={locale} messages={translations}>
          <Provider store={store}>
            <Router history={browserHistory} onUpdate={Root.logPageView}>
              <Route path="/" component={Home}>
                <IndexRoute component={Team} />
                <Route path="check/user/already-confirmed" component={UserAlreadyConfirmed} public />
                <Route path="check/user/confirmed" component={UserConfirmed} public />
                <Route path="check/user/unconfirmed" component={UserUnconfirmed} public />
                <Route path="check/user/password-reset" component={UserPasswordReset} public />
                <Route path="check/user/password-change" component={UserPasswordChange} public />
                <Route path="check/forbidden" component={AccessDenied} public />
                <Route path="check/not-found" component={NotFound} public />

                <Route path="check/user/:userId/edit" isEditing component={User} />
                <Route path="check/user/:userId(/:tab)" component={User} />
                <Route path="check/me/edit" isEditing component={Me} />
                <Route path="check/me(/:tab)" component={Me} />
                <Route path="check/teams/new" component={AddTeamPage} />
                <Route path="check/teams/find(/:slug)" component={AddTeamPage} />
                <Route path="check/teams" component={Teams} />
                <Route path="check/bot-garden" component={BotGarden} />
                <Route path="check/bot/:botId" component={Bot} />

                <Route path=":team/media/:mediaId" component={MediaPage} public />
                <Route path=":team/project/:projectId/media/:mediaId" component={MediaPage} public />
                <Route path=":team/media/:mediaId/report" component={ReportDesigner} public />
                <Route path=":team/media/:mediaId/tasks" component={MediaTasks} />
                <Route path=":team/media/:mediaId/metadata" component={MediaTasks} />
                <Route path=":team/project/:projectId/media/:mediaId/report" component={ReportDesigner} public />
                <Route path=":team/project/:projectId/media/:mediaId/tasks" component={MediaTasks} />
                <Route path=":team/project/:projectId/media/:mediaId/metadata" component={MediaTasks} />
                <Route path=":team/join" component={JoinTeam} />
                <Route path=":team/project/:projectId/edit" component={ProjectEdit} />
                <Route path=":team/project/:projectId(/:query)" component={Project} public />
                <Route path=":team/all-items(/:query)" component={AllItems} public />
                <Route path=":team/trash(/:query)" component={Trash} />
                <Route path=":team" component={Team} public />
                <Route path=":team/edit" action="edit" component={Team} />
                <Route path=":team/settings(/:tab)" action="settings" component={Team} />

                <Route path="*" component={NotFound} public />
              </Route>
            </Router>
          </Provider>
        </IntlProvider>
      </React.Fragment>
    );
  }
}

Root.contextTypes = {
  store: PropTypes.object,
};

export default Root;
