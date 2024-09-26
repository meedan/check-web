import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '../../cds/inputs/TextField';
import Chip from '../../cds/buttons-checkboxes-chips/Chip';

const useStyles = makeStyles(theme => ({
  field: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  chip: {
    margin: `0 ${theme.spacing(1)}px 0 ${theme.spacing(1)}px`,
  },
}));

const SmoochBotSetting = (props) => {
  const classes = useStyles();
  const { field, schema, value } = props;

  const handleChange = (key, newValue) => {
    props.onChange(key, newValue);
  };

  if (schema.type === 'boolean') {
    return (
      <React.Fragment key={`${field}-${value}`}>
        <FormControlLabel
          control={
            <Checkbox
              defaultChecked={value || schema.default}
              onChange={(event) => { handleChange(field, event.target.checked); }}
            />
          }
          label={schema.title}
        />
        <FormHelperText>{schema.description}</FormHelperText>
      </React.Fragment>
    );
  }

  if (schema.type === 'array') {
    const options = schema.items.enum;
    if (value) {
      value.forEach((selectedValue) => {
        if (options.indexOf(selectedValue) === -1) {
          options.push(selectedValue);
        }
      });
    }
    return (
      <FormControl fullWidth key={`${field}-${value}`} variant="outlined">
        <InputLabel>{schema.title}</InputLabel>
        <Select
          fullWidth
          label={schema.title}
          multiple
          renderValue={selectedValues => (
            <div>
              { selectedValues.map(selectedValue => (
                <Chip className={classes.chip} key={selectedValue} label={selectedValue} />
              ))}
            </div>
          )}
          value={value || []}
          variant="outlined"
          onChange={(event) => { handleChange(field, event.target.value); }}
        >
          {options.map(option => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
        <FormHelperText>{schema.description}</FormHelperText>
      </FormControl>
    );
  }

  const otherProps = {};
  const inputProps = {};

  if (schema.type === 'readonly') {
    otherProps.disabled = true;
  }

  if (schema.type === 'number') {
    otherProps.type = 'number';
    inputProps.step = 1;
    inputProps.min = 1;
  }

  if (field === /^smooch_template_newsletter_header_/.test(field) || field === 'turnio_cacert') {
    Object.assign(otherProps, {
      rows: 5,
      rowsMax: Infinity,
      multiline: true,
    });
  }

  return (
    <TextField
      className={classes.field}
      componentProps={inputProps}
      defaultValue={value || schema.default}
      helpContent={schema.description}
      key={`${field}-${value}`}
      label={schema.title.replace('Smooch', 'Sunshine')}
      variant="contained"
      onBlur={(event) => {
        let newValue = event.target.value.trim();
        if (schema.type === 'number') {
          newValue = parseInt(newValue, 10);
        }
        handleChange(field, newValue);
      }}
      {...otherProps}
    />
  );
};

SmoochBotSetting.propTypes = {
  field: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SmoochBotSetting;
