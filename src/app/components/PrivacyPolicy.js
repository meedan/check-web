import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import DocumentTitle from 'react-document-title';
import AboutRoute from '../relay/AboutRoute';
import marked from 'marked';
import { pageTitle } from '../helpers';

class PrivacyPolicyComponent extends Component {
  render() {
    var about = this.props.about;
    return (
      <DocumentTitle title={pageTitle('Privacy Policy')}>
        <div>
          <h2 className="main-title">Privacy Policy</h2>
          <div id="privacy-policy" dangerouslySetInnerHTML={{__html: marked(about.privacy_policy)}}></div>
        </div>
      </DocumentTitle>
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
