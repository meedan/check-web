import React from 'react';
import PropTypes from 'prop-types';
import CustomAutocomplete from '../layout/CustomAutocomplete';

const MultiSelectFilter = ({
  options,
  label,
  icon,
  onChange,
  selected,
  hide,
  labelProp,
  switchAndOr,
}) => {
  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  if (hide) {
    return null;
  }

  return (
    <CustomAutocomplete
      value={selected}
      icon={icon}
      label={label}
      getOptionLabel={option => labelProp === '' ? option : option[labelProp]}
      getOptionSelected={(option, value) => (JSON.stringify(option) === JSON.stringify(value))}
      onChange={handleChange}
      options={options}
      switchAndOr={switchAndOr}
    />
  );
};

MultiSelectFilter.defaultProps = {
  icon: null,
  selected: [],
  hide: false,
  labelProp: 'label',
  switchAndOr: null,
};

MultiSelectFilter.propTypes = {
  options: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ])).isRequired,
  label: PropTypes.node.isRequired,
  icon: PropTypes.element,
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ])),
  hide: PropTypes.bool,
  labelProp: PropTypes.string,
  switchAndOr: PropTypes.node,
};

export default MultiSelectFilter;
