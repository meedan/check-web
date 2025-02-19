import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Select from '../cds/inputs/Select';
import { humanTiplineNames } from '../../CheckChannels';
import ShareIcon from '../../icons/share.svg';

const PlatformSelect = ({
  installations,
  onChange,
  value,
}) => {
  const usedTiplines = installations?.smooch_enabled_integrations;

  console.log(installations, installations.json_settings, usedTiplines); // eslint-disable-line

  return (
    <Select
      iconLeft={<ShareIcon />}
      value={value}
      onChange={onChange}
    >
      <FormattedMessage
        defaultMessage="Platforms: All"
        description="Option to select all platforms"
        id="platformSelect.allPlatforms"
      >
        {text => <option value="all">{text}</option>}
      </FormattedMessage>
      {
        Object.entries(humanTiplineNames).map(([k, v]) => (
          <option key={k} value={String(k).toLowerCase()}>{v}</option>
        ))
      }
    </Select>
  );
};

PlatformSelect.propTypes = {
  installations: PropTypes.object.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default createFragmentContainer(PlatformSelect, graphql`
  fragment PlatformSelect_team_bot_installation on TeamBotInstallation {
    json_settings
    smooch_enabled_integrations
  }
`);
