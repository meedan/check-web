import React, { Component, PropTypes } from 'react';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import App from './App';
import { IndexComponent, TermsOfService, NotFound, CreateAccount } from '../components';
import { Sources, Source, User, Me } from '../components/source';
import Team  from '../components/team/Team';
import CreateTeam from '../components/team/CreateTeam'
export default class Root extends Component {
  static propTypes = {
    store: PropTypes.object.isRequired
  };

  render() {
    const { store } = this.props;
    const history = syncHistoryWithStore(browserHistory, store);
    return (
      <Provider store={store}>
        <Router history={history}>
          <Route path="/" component={App}>
            <IndexRoute component={IndexComponent} />
            <Route path="tos" component={TermsOfService} public={true} />
            <Route path="sources" component={Sources} />
            <Route path="sources/new" component={CreateAccount} />
            <Route path="source/:sourceId" component={Source} />
            <Route path="user/:userId" component={User} />
            <Route path="me" component={Me} />
            <Route path="team/:teamId" component={Team} />
              <Route path="teams/new" component={CreateTeam} />

            <Route path="*" component={NotFound} public={true} />
          </Route>
        </Router>
      </Provider>
    );
  }
}
