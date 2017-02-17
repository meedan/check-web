import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import DocumentTitle from 'react-document-title';
import AboutRoute from '../relay/AboutRoute';
import marked from 'marked';
import { pageTitle } from '../helpers';

const messages = defineMessages({
  title: {
    id: 'tos.title',
    defaultMessage: 'Terms of Service'
  }
});

class Tos extends Component {
  render() {
    const about = this.props.about;
    return (
      <DocumentTitle title={pageTitle(this.props.intl.formatMessage(messages.title), true)}>
        <div>
          <h2 className="main-title">Terms of Service</h2>
          <div id="tos" dangerouslySetInnerHTML={{ __html: marked(about.tos) }} />
        </div>
      </DocumentTitle>
    );
  }
}

Tos.propTypes = {
  intl: intlShape.isRequired
};

const TosContainer = Relay.createContainer(injectIntl(Tos), {
  fragments: {
    about: () => Relay.QL`
      fragment on About {
        tos
      }
    `,
  },
});

class TermsOfService extends Component {
  render() {
    const route = new AboutRoute();
    return (<Relay.RootContainer Component={TosContainer} route={route} />);
  }
}

export default TermsOfService;
