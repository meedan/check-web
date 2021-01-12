import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';

import SlackConfig from './SlackConfig';
import SettingsHeader from './SettingsHeader';
import { ContentColumn } from '../../styles/js/shared';

const TeamIntegrations = (props) => {
  const { team } = props;

  return (
    <Box className="team-integrations">
      <ContentColumn large>
        <SettingsHeader
          title={
            <FormattedMessage
              id="teamIntegrations.title"
              defaultMessage="Integrations"
            />
          }
          subtitle={
            <FormattedMessage
              id="teamIntegrations.subtitle"
              defaultMessage="Third party tools to enhance productivity."
            />
          }
          helpUrl="http://help.checkmedia.org/en/articles/4499092-slack-notifications"
        />
        <Box className="team-integrations__integrations">
          <SlackConfig team={team} />
        </Box>
      </ContentColumn>
    </Box>
  );
};

TeamIntegrations.propTypes = {
  // FIXME: Specify the required fields of "team"
  team: PropTypes.object.isRequired,
};

export default TeamIntegrations;
