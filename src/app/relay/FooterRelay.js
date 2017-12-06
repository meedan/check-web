import React from 'react';
import Relay from 'react-relay';
import AboutRoute from './AboutRoute';
import Footer from '../components/Footer';

const FooterContainer = Relay.createContainer(Footer, {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        name,
        version
      }
    `,
  },
});

const FooterRelay = () => {
  const route = new AboutRoute();
  return (<Relay.RootContainer Component={FooterContainer} route={route} />);
};

export default FooterRelay;
