import React from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import SwitchTeams from './SwitchTeams';
import PageTitle from '../PageTitle';
import { ContentColumn } from '../../styles/js/shared';

const messages = defineMessages({
  title: {
    id: 'teams.title',
    defaultMessage: 'Workspaces',
  },
});

const Teams = props => (
  <PageTitle prefix={props.intl.formatMessage(messages.title)} skipTeam>
    <ContentColumn>
      <SwitchTeams />
    </ContentColumn>
  </PageTitle>);

Teams.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

export default injectIntl(Teams);
