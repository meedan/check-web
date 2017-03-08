import React, { Component, PropTypes } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import DocumentTitle from 'react-document-title';
import AboutRoute from '../relay/AboutRoute';
import marked from 'marked';
import { pageTitle } from '../helpers';

const messages = defineMessages({
  title: {
    id: 'privacyPolicy.title',
    defaultMessage: 'Privacy Policy',
  },
});

class PrivacyPolicyComponent extends Component {
  render() {
    const about = this.props.about;
    return (
      <DocumentTitle title={pageTitle(this.props.intl.formatMessage(messages.title), true)}>
        <div>
          <h2 className="main-title"><FormattedMessage id="privacyPolicy.title" defaultMessage="Privacy Policy" /></h2>
          <div id="privacy-policy" dangerouslySetInnerHTML={{ __html: marked(about.privacy_policy) }} />
        </div>
      </DocumentTitle>
    );
  }
}

PrivacyPolicyComponent.propTypes = {
  intl: intlShape.isRequired,
};

const PrivacyPolicyContainer = Relay.createContainer(injectIntl(PrivacyPolicyComponent), {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        privacy_policy
      }
    `,
  },
});

class PrivacyPolicy extends Component {
  render() {
    const route = new AboutRoute();
    return (<Relay.RootContainer Component={PrivacyPolicyContainer} route={route} />);
  }
}

export default PrivacyPolicy;
