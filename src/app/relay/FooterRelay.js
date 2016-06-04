import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import AboutRoute from './AboutRoute';
import config from '../config/config.js';
import Footer from '../components/Footer';

const FooterContainer = Relay.createContainer(Footer, {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        name,
        version
      }
    `
  }
});

class FooterRelay extends Component {
  setUpGraphql() {
    Relay.injectNetworkLayer(new Relay.DefaultNetworkLayer(config.relayPath, { headers: config.relayHeaders }));
  }
  
  render() {
    var route = new AboutRoute();
    this.setUpGraphql();
    return (<Relay.RootContainer Component={FooterContainer} route={route} />);
  }
}

export default FooterRelay;
