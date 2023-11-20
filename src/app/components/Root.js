import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Redirect, Router, Route, browserHistory, IndexRoute } from 'react-router';
import ReactGA from 'react-ga';
import { IntlProvider } from 'react-intl';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import Home from './Home';
import RootLocale from './RootLocale';
import NotFound from './NotFound';
import UserConfirmPage from './UserConfirmPage';
import UserPasswordChange from './UserPasswordChange';
import UserPasswordReset from './login/UserPasswordReset';
import ErrorBoundary from './error/ErrorBoundary';
import User from './source/User';
import Me from './source/Me';
import Team from './team/Team';
import AssignedToMe from './team/AssignedToMe';
import TiplineInbox from './team/TiplineInbox';
import ImportedReports from './team/ImportedReports';
import SuggestedMatches from './team/SuggestedMatches';
import UnmatchedMedia from './team/UnmatchedMedia';
import Published from './team/Published';
import Spam from './team/Spam';
import Trash from './team/Trash';
import SaveFeed from './feed/SaveFeed';
import EditFeed from './feed/EditFeed';
import Feed from './feed/Feed';
import FeedItem from './feed/FeedItem';
import FeedClusterPage from './feed/FeedClusterPage';
import MediaPage from './media/MediaPage';
import ReportDesigner from './media/ReportDesigner';
import MediaTasks from './media/MediaTasks';
import SavedSearch from './search/SavedSearch';
import AllItems from './search/AllItems';
import MediaSource from './media/MediaSource';
import Sandbox from './Sandbox';
import SandboxCrash from './SandboxCrash';

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
          <ErrorBoundary component="Root">
            <Provider store={store}>
              <Router history={browserHistory} onUpdate={Root.logPageView}>
                <Route path="/" component={Home}>
                  <IndexRoute component={Team} />
                  <Route path="check/user/confirm/:confirmType" component={UserConfirmPage} public />
                  <Route path="check/user/password-reset" component={UserPasswordReset} public />
                  <Route path="check/user/password-change" component={UserPasswordChange} public />
                  <Route path="check/not-found" component={NotFound} public />
                  <Route path="check/user/:userId/edit" isEditing component={User} />
                  <Route path="check/user/:userId(/:tab)" component={User} />
                  <Route path="check/me/edit" isEditing component={Me} />
                  <Route path="check/me/ui-sandbox" component={Sandbox} />
                  <Route path="check/me/ui-sandbox/crash" component={SandboxCrash} />
                  <Route path="check/me(/:tab)" component={Me} />
                  <Route path="check/feed/:feedId/cluster/:clusterId" component={FeedItem} />
                  <Route path="check/feed/:feedId/request/:requestId" component={FeedClusterPage} />
                  <Route path=":team" component={Team} />
                  <Route path=":team/settings(/:tab)" component={Team} />
                  <Route path=":team/media/:mediaId" component={MediaPage} />
                  <Redirect from=":team/project/:projectId/media/:mediaId" to=":team/media/:mediaId" />
                  <Route path=":team/list/:listId/media/:mediaId" component={MediaPage} />
                  <Route path=":team/media/:mediaId/similar-media" component={MediaPage} view="similarMedia" />
                  <Redirect from=":team/project/:projectId/media/:mediaId/similar-media" to=":team/media/:mediaId/similar-media" />
                  <Route path=":team/list/:listId/media/:mediaId/similar-media" component={MediaPage} view="similarMedia" />
                  <Route path=":team/media/:mediaId/report" component={ReportDesigner} />
                  <Route path=":team/media/:mediaId/tasks" component={MediaTasks} />
                  <Route path=":team/media/:mediaId/metadata" component={MediaTasks} />
                  <Route path=":team/media/:mediaId/source" component={MediaSource} />
                  <Redirect from=":team/project/:projectId/media/:mediaId/report" to=":team/media/:mediaId/report" />
                  <Redirect from=":team/project/:projectId/media/:mediaId/tasks" to=":team/media/:mediaId/tasks" />
                  <Redirect from=":team/project/:projectId/media/:mediaId/metadata" to=":team/media/:mediaId/metadata" />
                  <Redirect from=":team/project/:projectId/media/:mediaId/source" to=":team/media/:mediaId/source" />
                  <Route path=":team/list/:listId/media/:mediaId/report" component={ReportDesigner} />
                  <Route path=":team/list/:listId/media/:mediaId/tasks" component={MediaTasks} />
                  <Route path=":team/list/:listId/media/:mediaId/metadata" component={MediaTasks} />
                  <Route path=":team/list/:listId/media/:mediaId/source" component={MediaSource} />
                  <Route path=":team/list/:savedSearchId(/:query)" component={SavedSearch} />
                  <Route path=":team/all-items(/:query)" component={AllItems} />
                  <Route path=":team/assigned-to-me(/:query)" component={AssignedToMe} />
                  <Route path=":team/tipline-inbox(/:query)" component={TiplineInbox} />
                  <Route path=":team/imported-fact-checks(/:query)" component={ImportedReports} />
                  <Route path=":team/suggested-matches(/:query)" component={SuggestedMatches} />
                  <Route path=":team/unmatched-media(/:query)" component={UnmatchedMedia} />
                  <Route path=":team/published(/:query)" component={Published} />
                  <Route path=":team/feed/:feedId/edit" component={EditFeed} />
                  <Route path=":team/feed/:feedId/:tab(/:query)" component={Feed} />
                  <Route path=":team/feed/create" component={SaveFeed} />
                  <Route path=":team/spam(/:query)" component={Spam} />
                  <Route path=":team/trash(/:query)" component={Trash} />
                  <Route path="*" component={NotFound} public />
                </Route>
              </Router>
            </Provider>
          </ErrorBoundary>
        </IntlProvider>
      </React.Fragment>
    );
  }
}

Root.contextTypes = {
  store: PropTypes.object,
};

export default Root;
