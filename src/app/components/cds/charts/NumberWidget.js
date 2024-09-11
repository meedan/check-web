import React from 'react';
import PropTypes from 'prop-types';

const NumberWidget = ({
  contextText,
  itemCount,
  title,
  unit,
}) => (
  <div>
    <div>
      {title}
    </div>
    <div>
      {itemCount} {unit}
    </div>
    <div>
      {contextText}
    </div>
  </div>
);

NumberWidget.defaultProps = {
  contextText: null,
  itemCount: '-',
  title: null,
  unit: null,
};

NumberWidget.propTypes = {
  contextText: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  itemCount: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  title: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  unit: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

export default NumberWidget;
