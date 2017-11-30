import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import ReactGA from 'react-ga';
import { IntlProvider, addLocaleData } from 'react-intl';
import ar from 'react-intl/locale-data/ar';
import en from 'react-intl/locale-data/en';
import fr from 'react-intl/locale-data/fr';
import pt from 'react-intl/locale-data/pt';
import config from 'config';
import App from './App';
import RootLocale from './RootLocale';
import NotFound from './NotFound';
import AccessDenied from './AccessDenied';
import UserAlreadyConfirmed from './UserAlreadyConfirmed';
import UserConfirmed from './UserConfirmed';
import UserUnconfirmed from './UserUnconfirmed';
import UserPasswordChange from './UserPasswordChange';
import UserPasswordReset from './UserPasswordReset';
import Source from './source/Source';
import User from './source/User';
import Me from './source/Me';
import CreateTeam from './team/CreateTeam';
import Teams from './team/Teams';
import CreateProjectMedia from './media/CreateMedia';
import MediaEmbed from './media/MediaEmbed';
import ProjectMedia from './media/Media';
import Project from './project/Project';
import ProjectHeader from './project/ProjectHeader';
import ProjectEdit from './project/ProjectEdit';
import TeamRelay from '../relay/containers/TeamRelay';
import JoinTeamRelay from '../relay/containers/JoinTeamRelay';
import TrashRelay from '../relay/containers/TrashRelay';
import Search from '../components/Search';
import CheckContext from '../CheckContext';
import translations from '../../../localization/translations/translations';

// Localization
let locale = config.locale || navigator.languages || navigator.language || navigator.userLanguage || 'en';
if (locale.constructor === Array) {
  locale = locale[0];
}
locale = locale.replace(/[-_].*$/, '');

if (!global.Intl) {
  require(['intl'], (intl) => {
    global.Intl = intl;
//    Commented out while build is not optimized for this!
//    require('intl/locale-data/jsonp/' + locale + '.js');
  });
}

try {
  const localeData = {
    en,
    fr,
    ar,
    pt,
  };
  addLocaleData([...localeData[locale]]);
} catch (e) {
  locale = 'en';
}

export default class Root extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
  };

  getContext() {
    return new CheckContext(this);
  }

  setStore() {
    const history = syncHistoryWithStore(browserHistory, this.props.store);
    const context = this.getContext();
    const store = context.store || this.props.store;

    const data = { history, locale };

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
    window.Check = { store };

    return (
      <div>
        <RootLocale locale={locale} />
        <IntlProvider locale={locale} messages={translations[locale]}>
          <Provider store={store}>
            <Router history={this.state.history} onUpdate={this.logPageView.bind(this)}>
              <Route path="/" component={App}>
                <IndexRoute component={TeamRelay} />
                <Route path="check/user/already-confirmed" component={UserAlreadyConfirmed} public />
                <Route path="check/user/confirmed" component={UserConfirmed} public />
                <Route path="check/user/unconfirmed" component={UserUnconfirmed} public />
                <Route path="check/user/password-reset" component={UserPasswordReset} public />
                <Route path="check/user/password-change" component={UserPasswordChange} public />
                <Route path="check/forbidden" component={AccessDenied} public />
                <Route path="check/404" component={NotFound} public />

                <Route path="check/user/:userId" component={User} />
                <Route path="check/me" component={Me} />
                <Route path="check/teams/new" component={CreateTeam} />
                <Route path="check/teams" component={Teams} />

                <Route path=":team/medias/new" component={CreateProjectMedia} />
                <Route path=":team/project/:projectId/media/:mediaId" component={ProjectMedia} public />
                <Route path=":team/project/:projectId/media/:mediaId/embed" component={MediaEmbed} public />
                <Route path=":team/project/:projectId/source/:sourceId" component={Source} public />
                <Route path=":team/join" component={JoinTeamRelay} />
                <Route path=":team/project/:projectId/edit" component={ProjectEdit} />
                <Route path=":team/project/:projectId(/:query)" component={Project} public />
                <Route path=":team/search(/:query)" component={Search} public />
                <Route path=":team/trash(/:query)" component={TrashRelay} />
                <Route path=":team" component={TeamRelay} public />

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
  store: React.PropTypes.object,
};
