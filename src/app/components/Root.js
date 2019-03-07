import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import ReactGA from 'react-ga';
import { IntlProvider, addLocaleData } from 'react-intl';
import ar from 'react-intl/locale-data/ar';
import en from 'react-intl/locale-data/en';
import fr from 'react-intl/locale-data/fr';
import pt from 'react-intl/locale-data/pt';
import es from 'react-intl/locale-data/es';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import App from './App';
import RootLocale from './RootLocale';
import NotFound from './NotFound';
import AccessDenied from './AccessDenied';
import UserAlreadyConfirmed from './UserAlreadyConfirmed';
import UserConfirmed from './UserConfirmed';
import UserUnconfirmed from './UserUnconfirmed';
import UserPasswordChange from './UserPasswordChange';
import UserPasswordReset from './UserPasswordReset';
import UserTos from './UserTos';
import Source from './source/Source';
import User from './source/User';
import Me from './source/Me';
import Team from './team/Team';
import AddTeamPage from './team/AddTeamPage';
import JoinTeam from './team/JoinTeam';
import Teams from './team/Teams';
import Trash from './team/Trash';
import ProjectMedia from './media/Media';
import MediaEmbed from './media/MediaEmbed';
import Memebuster from './memebuster/Memebuster';
import Project from './project/Project';
import ProjectEdit from './project/ProjectEdit';
import Search from './search/Search';
import BotGarden from './BotGarden';
import Bot from './Bot';
import CheckContext from '../CheckContext';
import translations from '../../../localization/translations/translations';

// Localization
let locale = config.locale || navigator.languages || navigator.language || navigator.userLanguage || 'en';
if (locale.constructor === Array) {
  ([locale] = locale);
}
locale = locale.replace(/[-_].*$/, '');

if (!global.Intl) {
  // eslint-disable-next-line max-len
  // eslint-disable-next-line import/no-dynamic-require, global-require, require-path-exists/tooManyArguments
  require(['intl'], (intl) => {
    global.Intl = intl;
    // TODO Commented out while build is not optimized for this!
    // eslint-disable-next-line global-require
    // require(`intl/locale-data/jsonp/${locale}.js`);
  });
}

try {
  const localeData = {
    en,
    fr,
    ar,
    pt,
    es,
  };
  addLocaleData([...localeData[locale]]);
} catch (e) {
  locale = 'en';
}

class Root extends Component {
  static logPageView() {
    if (config.googleAnalyticsCode) {
      ReactGA.set({ page: window.location.pathname });
      ReactGA.pageview(window.location.pathname);
    }
  }

  static propTypes = {
    store: PropTypes.object.isRequired,
  };

  componentWillMount() {
    this.setStore();
  }

  // eslint-disable-next-line class-methods-use-this
  componentDidMount() {
    if (config.googleAnalyticsCode) {
      ReactGA.initialize(config.googleAnalyticsCode, { debug: false });
    }
  }

  componentWillUpdate() {
    this.setStore();
  }

  getContext() {
    return new CheckContext(this);
  }

  setStore() {
    const history = syncHistoryWithStore(browserHistory, this.props.store);
    const context = this.getContext();
    const store = context.store || this.props.store;

    const data = { history, locale };

    if (config.pusherKey) {
      // Pusher is imported at runtime from a <script file> tag.
      // eslint-disable-next-line no-undef
      Pusher.logToConsole = !!config.pusherDebug;
      // eslint-disable-next-line no-undef
      const pusher = new Pusher(config.pusherKey, {
        cluster: config.pusherCluster,
        encrypted: true,
      });
      data.pusher = pusher;
    }

    context.setContextStore(data, store);
    this.setState(data);
  }

  render() {
    const { store } = this.props;
    window.Check = { store };

    return (
      <div>
        <RootLocale locale={locale} />
        <IntlProvider locale={locale} messages={translations[locale]}>
          <Provider store={store}>
            <Router history={this.state.history} onUpdate={Root.logPageView}>
              <Route path="/" component={App}>
                <IndexRoute component={Team} />
                <Route path="check/user/already-confirmed" component={UserAlreadyConfirmed} public />
                <Route path="check/user/confirmed" component={UserConfirmed} public />
                <Route path="check/user/unconfirmed" component={UserUnconfirmed} public />
                <Route path="check/user/password-reset" component={UserPasswordReset} public />
                <Route path="check/user/password-change" component={UserPasswordChange} public />
                <Route path="check/user/tos" component={UserTos} public />
                <Route path="check/forbidden" component={AccessDenied} public />
                <Route path="check/not-found" component={NotFound} public />

                <Route path="check/user/:userId(/:tab)" component={User} />
                <Route path="check/me/edit" isEditing component={Me} />
                <Route path="check/me(/:tab)" component={Me} />
                <Route path="check/teams/new" component={AddTeamPage} />
                <Route path="check/teams/find(/:slug)" component={AddTeamPage} />
                <Route path="check/teams" component={Teams} />
                <Route path="check/bot-garden" component={BotGarden} />
                <Route path="check/bot/:botId" component={Bot} />

                <Route path=":team/project/:projectId/media/:mediaId" component={ProjectMedia} public />
                <Route path=":team/project/:projectId/media/:mediaId/embed" component={MediaEmbed} public />
                <Route path=":team/project/:projectId/media/:mediaId/memebuster" component={Memebuster} />
                <Route path=":team/project/:projectId/source/:sourceId" component={Source} public />
                <Route path=":team/project/:projectId/source/:sourceId/edit" isEditing component={Source} />
                <Route path=":team/join" component={JoinTeam} />
                <Route path=":team/project/:projectId/edit" component={ProjectEdit} />
                <Route path=":team/project/:projectId/dense(/:query)" view="dense" component={Project} public />
                <Route path=":team/project/:projectId/list(/:query)" view="list" component={Project} public />
                <Route path=":team/project/:projectId(/:query)" component={Project} public />
                <Route path=":team/search(/:query)" component={Search} public />
                <Route path=":team/trash(/:query)" component={Trash} />
                <Route path=":team" component={Team} public />
                <Route path=":team/edit" action="edit" component={Team} />
                <Route path=":team/settings" action="settings" component={Team} />

                <Route path="*" component={NotFound} public />
              </Route>
            </Router>
          </Provider>
        </IntlProvider>
      </div>
    );
  }
}

Root.contextTypes = {
  store: PropTypes.object,
};

export default Root;
