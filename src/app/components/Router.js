import React, { Component, PropTypes } from 'react';
import superagent from 'superagent';
import config from '../config/config.js';
import Home from './Home';
import Message from './Message';

class Router extends Component {
  render() {
    const { close, state } = this.props;

    let view = ((state && state.app && state.app.view) ? state.app.view : 'home');

    switch (view) {
      case 'home':
        return (<Home {...this.props} />);
      case 'message':
        return (<Message {...this.props} />);
      default:
        return null;
    }
  }
}

Router.propTypes = {
  state: PropTypes.object.isRequired
};

export default Router;
