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
import SourceRelay from '../relay/containers/SourceRelay';
import UserRelay from '../relay/containers/UserRelay';
import MeRelay from '../relay/containers/MeRelay';
import CreateTeam from './team/CreateTeam';
import Teams from './team/Teams';
import CreateProjectMedia from './media/CreateMedia';
import MediaEmbed from './media/MediaEmbed';
import ProjectMedia from './media/Media';
import ProjectRelay from '../relay/containers/ProjectRelay';
import ProjectEditRelay from '../relay/containers/ProjectEditRelay';
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
  // eslint-disable-next-line import/no-dynamic-require, global-require
  require(['intl'], (intl) => {
    global.Intl = intl;
// TODO Commented out while build is not optimized for this!
// eslint-disable-next-line global-require
// require('intl/locale-data/jsonp/' + locale + '.js');
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

class Root extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired,
  };

  static logPageView() {
    if (config.googleAnalyticsCode) {
      ReactGA.set({ page: window.location.pathname });
      ReactGA.pageview(window.location.pathname);
    }
  }

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
      Pusher.logToConsole = !!config.pusherDebug;
      const pusher = new Pusher(config.pusherKey, { encrypted: true });
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
                <IndexRoute component={TeamRelay} />
                <Route path="check/user/already-confirmed" component={UserAlreadyConfirmed} public />
                <Route path="check/user/confirmed" component={UserConfirmed} public />
                <Route path="check/user/unconfirmed" component={UserUnconfirmed} public />
                <Route path="check/user/password-reset" component={UserPasswordReset} public />
                <Route path="check/user/password-change" component={UserPasswordChange} public />
                <Route path="check/forbidden" component={AccessDenied} public />
                <Route path="check/404" component={NotFound} public />

                <Route path="check/user/:userId" component={UserRelay} />
                <Route path="check/me" component={MeRelay} />
                <Route path="check/teams/new" component={CreateTeam} />
                <Route path="check/teams" component={Teams} />

                <Route path=":team/medias/new" component={CreateProjectMedia} />
                <Route path=":team/project/:projectId/media/:mediaId" component={ProjectMedia} public />
                <Route path=":team/project/:projectId/media/:mediaId/embed" component={MediaEmbed} public />
                <Route path=":team/project/:projectId/source/:sourceId" component={SourceRelay} public />
                <Route path=":team/join" component={JoinTeamRelay} />
                <Route path=":team/project/:projectId/edit" component={ProjectEditRelay} />
                <Route path=":team/project/:projectId(/:query)" component={ProjectRelay} public />
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

export default Root;
