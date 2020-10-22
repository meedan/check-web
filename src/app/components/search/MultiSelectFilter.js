import React from 'react';
import PropTypes from 'prop-types';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
}));

const MultiSelectFilter = ({
  options,
  label,
  onChange,
  selected,
  show,
  labelProp,
}) => {
  const classes = useStyles();

  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  if (!show) {
    return null;
  }

  return (
    <Autocomplete
      multiple
      key={label}
      className={classes.root}
      limitTags={3}
      options={options}
      getOptionLabel={option => labelProp === '' ? option : option[labelProp]}
      getOptionSelected={(option, value) => (JSON.stringify(option) === JSON.stringify(value))}
      value={selected}
      filterSelectedOptions
      renderInput={params => (
        <TextField
          {...params}
          variant="outlined"
          label={label}
        />
      )}
      onChange={handleChange}
    />
  );
};

MultiSelectFilter.defaultProps = {
  selected: [],
  show: true,
  labelProp: 'label',
};

MultiSelectFilter.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  label: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  selected: PropTypes.arrayOf(PropTypes.object),
  show: PropTypes.bool,
  labelProp: PropTypes.string,
};

export default MultiSelectFilter;
