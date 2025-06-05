import PropTypes from 'prop-types';
import CheckChannels from './constants/CheckChannels';
import CheckArticleTypes from './constants/CheckArticleTypes';
import CheckMediaTypes from './constants/CheckMediaTypes';

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
  articleType: PropTypes.oneOf(Object.values(CheckArticleTypes)),
  mediaType: PropTypes.oneOf(Object.values(CheckMediaTypes)),
};

export default CheckPropTypes;
