import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Select from '../cds/inputs/Select';
import { humanTiplineNames } from '../../CheckChannels';
import ShareIcon from '../../icons/share.svg';

const PlatformSelect = ({
  onChange,
  value,
}) => (
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

PlatformSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PlatformSelect;
