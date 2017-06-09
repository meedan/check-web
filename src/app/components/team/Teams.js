import React, { Component, PropTypes } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import SwitchTeams from './SwitchTeams.js';
import PageTitle from '../PageTitle';
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
      <PageTitle prefix={this.props.intl.formatMessage(messages.title)} skipTeam={true}>
        <section className="teams">
          <ContentColumn className="card">
            <Heading><FormattedMessage id="teams.yourTeams" defaultMessage="Your Teams" /></Heading>
            <SwitchTeams />
          </ContentColumn>
        </section>
      </PageTitle>
    );
  }
}

Teams.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Teams);
