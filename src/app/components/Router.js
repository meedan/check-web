import React, { Component, PropTypes } from 'react';
import superagent from 'superagent';
import config from '../config/config.js';
import Home from './Home';
import Message from './Message';

class Router extends Component {
  render() {
    const { close, state } = this.props;
    return (<Home {...this.props} />);
  }
}

Router.propTypes = {
  state: PropTypes.object.isRequired
};

export default Router;
