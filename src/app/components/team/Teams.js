import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import SwitchTeams from './SwitchTeams';
import PageTitle from '../PageTitle';
import { ContentColumn } from '../../styles/js/shared';

const messages = defineMessages({
  title: {
    id: 'teams.title',
    defaultMessage: 'Teams',
  },
});

class Teams extends Component {
  render() {
    return (
      <PageTitle prefix={this.props.intl.formatMessage(messages.title)} skipTeam>
        <ContentColumn>
          <SwitchTeams />
        </ContentColumn>
      </PageTitle>
    );
  }
}

Teams.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(Teams);
