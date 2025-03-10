import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Select from '../cds/inputs/Select';
import { humanTiplineNames } from '../../CheckChannels';
import ShareIcon from '../../icons/share.svg';

const PlatformSelect = ({
  onChange,
  platforms,
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
    { platforms.length ?
      platforms.map(p =>
        <option key={p} value={p}>{humanTiplineNames[String(p).toUpperCase()]}</option>)
      :
      <FormattedMessage
        defaultMessage="No available platforms"
        description="Option when there are no tipline platforms with data"
        id="platformSelect.noPlatforms"
      >
        {text => <option disabled value="">{text}</option>}
      </FormattedMessage>
    }
  </Select>
);

PlatformSelect.defaultProps = {
  platforms: null,
};

PlatformSelect.propTypes = {
  platforms: PropTypes.array,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default PlatformSelect;
