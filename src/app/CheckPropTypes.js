import PropTypes from 'prop-types';
import CheckChannels from './CheckChannels';

const CheckPropTypes = {
  reportState: PropTypes.oneOf(['paused', 'published', 'unpublished']),
  channel: PropTypes.oneOf([
    CheckChannels.FETCH,
    CheckChannels.ANYTIPLINE,
    CheckChannels.MANUAL,
    CheckChannels.BROWSER_EXTENSION,
    CheckChannels.API,
    CheckChannels.ZAPIER,
    ...Object.values(CheckChannels.TIPLINE),
    CheckChannels.WEB_FORM,
    CheckChannels.SHARED_DATABASE,
  ]),
};

export default CheckPropTypes;
