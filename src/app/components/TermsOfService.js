import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import AboutRoute from '../relay/AboutRoute';
import marked from 'marked';

class Tos extends Component {
  render() {
    var about = this.props.about;
    return (
      <div>
        <h2>Terms of Service</h2>
        <div id="tos" dangerouslySetInnerHTML={{__html: marked(about.tos)}}></div>
      </div>
    );
  }
}

const TosContainer = Relay.createContainer(Tos, {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        tos
      }
    `
  }
});

class TermsOfService extends Component {
  render() {
    var route = new AboutRoute();
    return (<Relay.RootContainer Component={TosContainer} route={route} />);
  }
}

export default TermsOfService;
