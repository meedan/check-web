import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import util from 'util';
import Header from './Header';
import FooterRelay from '../relay/FooterRelay';
import LoginMenu from './LoginMenu';
import Message from './Message';
import { request } from '../actions/actions';
import Colors from 'material-ui/lib/styles/colors';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';
import themeDecorator from 'material-ui/lib/styles/theme-decorator';
import AppBar from 'material-ui/lib/app-bar';
import TeamSidebar from './TeamSidebar';

import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import config from 'config';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: Colors.blueGrey400,
    primary2Color: Colors.blueGrey600,
    primary3Color: Colors.blueGrey800,
    accent1Color: Colors.blue600,
    accent2Color: Colors.blue700,
    accent3Color: Colors.blue800
  }
});

class Home extends Component {
  setUpGraphql(token) {
    var headers = config.relayHeaders;
    if (token) {
      headers = {
        'X-Checkdesk-Token': token
      }
    }
    Relay.injectNetworkLayer(new Relay.DefaultNetworkLayer(config.relayPath, { headers: headers }));
  }

  startSession(state) {
    var that = this;
    if (!state.token && !state.error) {
      var token = window.storage.getValue('token');
      if (token) {
        state.token = token;
        that.forceUpdate();
      }
      else {
        var failureCallback = function(message) {
          state.message = message;
          state.error = true;
          that.forceUpdate();
        };
        var successCallback = function(data) {
          if (data) {
            state.token = data.token;
          }
          else {
            state.error = true;
          }
          that.forceUpdate();
        }
        request('get', 'me', failureCallback, successCallback);
      }
    }
  }

  render() {
    const { state } = this.props;

    this.startSession(state.app);

    this.setUpGraphql(state.app.token);

    if (!this.props.children.props.route.public && !state.app.token) {
      if (state.app.error) {
        return (<LoginMenu {...this.props} />);
      }
      return null;
    }

    const routeIsFullscreen = this.props.children.props.route.fullscreen;
    if (routeIsFullscreen) {
      return (<div className='home home--fullscreen'>{this.props.children}</div>);
    }

    return (
      <div className='home'>
        <TeamSidebar />

        <main className='home__content'>
          <AppBar title="Checkdesk" className="top-bar" iconElementRight={<Header {...this.props} />} iconClassNameLeft={null} />

          <div className="global-message"><Message message={state.app.message} /></div>

          <div className="children">{this.props.children}</div>

          <FooterRelay {...this.props} />
        </main>
      </div>
    );
  }
}

export default themeDecorator(muiTheme)(Home);
