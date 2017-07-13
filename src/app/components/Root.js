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
import App from './App';
import {
  RootLocale,
  IndexComponent,
  NotFound,
  AccessDenied,
  UserAlreadyConfirmed,
  UserConfirmed,
  UserUnconfirmed,
  UserPasswordChange,
  UserPasswordReset,
  LoginEmailPage,
} from '../components';
import {
  Sources,
  Source,
  User,
  Me,
} from '../components/source';
import {
  Team,
  TeamMembers,
  CreateTeam,
  JoinTeam,
  Teams,
} from '../components/team';
import {
  CreateProjectMedia,
  ProjectMedia,
  MediaEmbed,
} from '../components/media';
import {
  Project,
  ProjectHeader,
  ProjectEdit,
} from '../components/project';
import Search from '../components/Search';
import CheckContext from '../CheckContext';
import translations from '../../../localization/translations/translations';
import config from 'config';

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
    window.Check = { store };

    return (
      <div>
        <RootLocale locale={locale} />
        <IntlProvider locale={locale} messages={translations[locale]}>
          <Provider store={store}>
            <Router history={this.state.history} onUpdate={this.logPageView.bind(this)}>
              <Route path="/" component={App}>
                <IndexRoute component={Team} />
                <Route path="check/user/already-confirmed" component={UserAlreadyConfirmed} public />
                <Route path="check/user/confirmed" component={UserConfirmed} public />
                <Route path="check/user/unconfirmed" component={UserUnconfirmed} public />
                <Route path="check/user/password-reset" component={UserPasswordReset} public />
                <Route path="check/user/password-change" component={UserPasswordChange} public />
                <Route path="check/forbidden" component={AccessDenied} public />
                <Route path="check/404" component={NotFound} public />

                <Route path="check/source/:sourceId" component={Source} />
                <Route path="check/user/:userId" component={User} />
                <Route path="check/me" component={Me} />
                <Route path="check/teams/new" component={CreateTeam} />
                <Route path="check/teams" component={Teams} />

                <Route path=":team/medias/new" component={CreateProjectMedia} />
                <Route path=":team/project/:projectId/media/:mediaId" component={ProjectMedia} public />
                <Route path=":team/project/:projectId/media/:mediaId/embed" component={MediaEmbed} public />
                <Route path=":team/project/:projectId/source/:sourceId" component={Source} public />
                <Route path=":team/join" component={JoinTeam} />
                <Route path=":team/members" component={TeamMembers} />
                <Route path=":team/project/:projectId/edit" component={ProjectEdit} />
                <Route path=":team/project/:projectId(/:query)" component={Project} public />
                <Route path=":team/search(/:query)" component={Search} public />
                <Route path=":team" component={Team} public />

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
