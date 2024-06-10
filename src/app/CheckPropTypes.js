import PropTypes from 'prop-types';

const CheckPropTypes = {
  reportState: PropTypes.oneOf(['paused', 'published', 'unpublished']),
};

export default CheckPropTypes;
