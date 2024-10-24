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
import Me from './user/Me';
import Team from './team/Team';
import AssignedToMe from './team/AssignedToMe';
import TiplineInbox from './team/TiplineInbox';
import SuggestedMatches from './team/SuggestedMatches';
import UnmatchedMedia from './team/UnmatchedMedia';
import Spam from './team/Spam';
import Trash from './team/Trash';
import CreateFeed from './feed/CreateFeed';
import EditFeedTeam from './feed/EditFeedTeam';
import Feed from './feed/Feed';
import FeedInvitation from './feed/FeedInvitation';
import FeedInvitationRespond from './feed/FeedInvitationRespond';
import FeedItem from './feed/FeedItem';
import MediaPage from './media/MediaPage';
import ReportDesigner from './media/ReportDesigner';
import MediaTasks from './media/MediaTasks';
import SavedSearch from './search/SavedSearch';
import AllItems from './search/AllItems';
import MediaSource from './media/MediaSource';
import Sandbox from './cds/Sandbox';
import SandboxCrash from './cds/SandboxCrash';
import FeedPage from './feed/FeedPage';
import Explainers from './article/Explainers';
import FactChecks from './article/FactChecks';
import ImportedArticles from './article/ImportedArticles';
import PublishedArticles from './article/PublishedArticles';
import TiplineDashBoard from './dashboard/TiplineDashboard';
import ArticlesDashboard from './dashboard/ArticlesDashboard';

import TrashedArticles from './article/TrashedArticles';

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
    const { locale, store, translations } = this.props;
    window.Check = { store };

    return (
      <React.Fragment>
        <RootLocale locale={locale} />
        <IntlProvider locale={locale} messages={translations}>
          <ErrorBoundary component="Root">
            <Provider store={store}>
              <Router history={browserHistory} onUpdate={Root.logPageView}>
                <Route component={Home} path="/">
                  <IndexRoute component={Team} />
                  <Route component={UserConfirmPage} path="check/user/confirm/:confirmType" public />
                  <Route component={UserPasswordReset} path="check/user/password-reset" public />
                  <Route component={UserPasswordChange} path="check/user/password-change" public />
                  <Route component={NotFound} path="check/not-found" public />
                  <Route component={Me} isEditing path="check/me/edit" />
                  <Route component={Sandbox} path="check/me/ui-sandbox" />
                  <Route component={SandboxCrash} path="check/me/ui-sandbox/crash" />
                  <Route component={Me} path="check/me(/:tab)" />
                  <Route component={FeedInvitation} path="check/feed/:feedId/invitation" splash />
                  <Route component={Team} path=":team" />
                  <Route component={Team} path=":team/settings(/:tab)" />
                  <Route component={MediaPage} path=":team/media/:mediaId" />
                  <Redirect from=":team/project/:projectId/media/:mediaId" to=":team/media/:mediaId" />
                  <Route component={MediaPage} path=":team/list/:listId/media/:mediaId" />
                  <Route component={MediaPage} path=":team/media/:mediaId/similar-media" view="similarMedia" />
                  <Redirect from=":team/project/:projectId/media/:mediaId/similar-media" to=":team/media/:mediaId/similar-media" />
                  <Route component={MediaPage} path=":team/list/:listId/media/:mediaId/similar-media" view="similarMedia" />
                  <Route component={ReportDesigner} path=":team/media/:mediaId/report" />
                  <Route component={MediaTasks} path=":team/media/:mediaId/tasks" />
                  <Route component={MediaTasks} path=":team/media/:mediaId/metadata" />
                  <Route component={MediaSource} path=":team/media/:mediaId/source" />
                  <Redirect from=":team/project/:projectId/media/:mediaId/report" to=":team/media/:mediaId/report" />
                  <Redirect from=":team/project/:projectId/media/:mediaId/tasks" to=":team/media/:mediaId/tasks" />
                  <Redirect from=":team/project/:projectId/media/:mediaId/metadata" to=":team/media/:mediaId/metadata" />
                  <Redirect from=":team/project/:projectId/media/:mediaId/source" to=":team/media/:mediaId/source" />
                  <Route component={ReportDesigner} path=":team/list/:listId/media/:mediaId/report" />
                  <Route component={MediaTasks} path=":team/list/:listId/media/:mediaId/tasks" />
                  <Route component={MediaTasks} path=":team/list/:listId/media/:mediaId/metadata" />
                  <Route component={MediaSource} path=":team/list/:listId/media/:mediaId/source" />
                  <Route component={SavedSearch} path=":team/list/:savedSearchId(/:query)" />
                  <Route component={AllItems} path=":team/all-items(/:query)" />
                  <Route component={AssignedToMe} path=":team/assigned-to-me(/:query)" />
                  <Route component={TiplineInbox} path=":team/tipline-inbox(/:query)" />
                  <Route component={SuggestedMatches} path=":team/suggested-matches(/:query)" />
                  <Route component={UnmatchedMedia} path=":team/unmatched-media(/:query)" />
                  <Route component={TiplineDashBoard} path=":team/dashboard" />
                  <Route component={CreateFeed} path=":team/feed/create" />
                  <Route component={FeedPage} path=":team/feeds" />
                  <Route component={EditFeedTeam} path=":team/feed/:feedId/edit" />
                  <Route component={FeedInvitationRespond} path=":team/feed/:feedId/invitation" />
                  <Route component={FeedItem} path=":team/feed/:feedId/item/:projectMediaId" />
                  <Route component={Feed} path=":team/feed/:feedId(/:tab(/:query))" />
                  <Route component={Spam} path=":team/spam(/:query)" />
                  <Route component={Trash} path=":team/trash(/:query)" />
                  <Route component={Explainers} path=":team/articles/explainers" />
                  <Route component={FactChecks} path=":team/articles/fact-checks" />
                  <Route component={ArticlesDashboard} path=":team/articles/dashboard" />
                  <Route component={ImportedArticles} path=":team/articles/imported-fact-checks" />
                  <Route component={PublishedArticles} path=":team/articles/published" />
                  <Route component={TrashedArticles} path=":team/articles/trash" />
                  <Route component={NotFound} path="*" public />
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
