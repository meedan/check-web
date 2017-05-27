import React, { Component, PropTypes } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import SwitchTeams from './SwitchTeams.js';
import DocumentTitle from 'react-document-title';
import { pageTitle } from '../../helpers';
import ContentColumn from '../layout/ContentColumn';
import Heading from '../layout/Heading';

const messages = defineMessages({
  title: {
    id: 'teams.title',
    defaultMessage: 'Teams',
  },
});

class Teams extends Component {
  render() {
    return (
      <DocumentTitle title={pageTitle(this.props.intl.formatMessage(messages.title), true)}>
        <section className="teams">
          <ContentColumn className="card">
            <Heading><FormattedMessage id="teams.yourTeams" defaultMessage="Your Teams" /></Heading>
            <SwitchTeams />
          </ContentColumn>
        </section>
      </DocumentTitle>
    );
  }
}

Teams.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Teams);
