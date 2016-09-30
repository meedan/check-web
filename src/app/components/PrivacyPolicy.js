import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import AboutRoute from '../relay/AboutRoute';
import marked from 'marked';

class PrivacyPolicyComponent extends Component {
  render() {
    var about = this.props.about;
    return (
      <div>
        <h2 className="main-title">Privacy Policy</h2>
        <div id="privacy-policy" dangerouslySetInnerHTML={{__html: marked(about.privacy_policy)}}></div>
      </div>
    );
  }
}

const PrivacyPolicyContainer = Relay.createContainer(PrivacyPolicyComponent, {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        privacy_policy
      }
    `
  }
});

class PrivacyPolicy extends Component {
  render() {
    var route = new AboutRoute();
    return (<Relay.RootContainer Component={PrivacyPolicyContainer} route={route} />);
  }
}

export default PrivacyPolicy;
