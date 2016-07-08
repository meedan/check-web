import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import util from 'util';
import config from '../config/config.js';
import Header from './Header';
import FooterRelay from '../relay/FooterRelay';
import LoginMenu from './LoginMenu';
import Message from './Message';
import { request } from '../actions/actions';
import Colors from 'material-ui/lib/styles/colors';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';
import themeDecorator from 'material-ui/lib/styles/theme-decorator';
import AppBar from 'material-ui/lib/app-bar';

const muiTheme = getMuiTheme({
  accent1Color: Colors.deepOrange500,
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

    console.log(state);
    
    this.startSession(state.app);
    
    this.setUpGraphql(state.app.token);
    
    return (
      <div>
        <AppBar title="Checkdesk" className="top-bar" iconElementRight={<Header {...this.props} />} iconClassNameLeft={null} />
        <Message {...this.props} />
        {(() => {
          if (!state.app.token) {
            return (<LoginMenu {...this.props} />);
          }
        })()}
        <FooterRelay {...this.props} />
      </div>
    );
  }
}

export default themeDecorator(muiTheme)(Home);
