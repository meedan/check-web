import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import CustomAutocomplete from '../layout/CustomAutocomplete';

const useStyles = makeStyles({
  root: {
    minWidth: '200px',
  },
});

const MultiSelectFilter = ({
  options,
  label,
  icon,
  onChange,
  selected,
  hide,
  labelProp,
  append,
}) => {
  const classes = useStyles();

  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  if (hide) {
    return null;
  }

  return (
    <CustomAutocomplete
      className={classes.root}
      defaultValue={selected}
      icon={icon}
      label={label}
      getOptionLabel={option => labelProp === '' ? option : option[labelProp]}
      getOptionSelected={(option, value) => (JSON.stringify(option) === JSON.stringify(value))}
      onChange={handleChange}
      options={options}
      append={append}
    />
  );
};

MultiSelectFilter.defaultProps = {
  selected: [],
  hide: false,
  labelProp: 'label',
};

MultiSelectFilter.propTypes = {
  options: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ])).isRequired,
  label: PropTypes.node.isRequired,
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string,
  ])),
  hide: PropTypes.bool,
  labelProp: PropTypes.string,
};

export default MultiSelectFilter;
