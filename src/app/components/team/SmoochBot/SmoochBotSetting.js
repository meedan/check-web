import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';

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
  const { value, schema, field } = props;

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
      <FormControl key={`${field}-${value}`} variant="outlined" fullWidth>
        <InputLabel>{schema.title}</InputLabel>
        <Select
          label={schema.title}
          value={value || []}
          onChange={(event) => { handleChange(field, event.target.value); }}
          renderValue={selectedValues => (
            <div>
              { selectedValues.map(selectedValue => (
                <Chip key={selectedValue} label={selectedValue} className={classes.chip} />
              ))}
            </div>
          )}
          variant="outlined"
          multiple
          fullWidth
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

  if (field === 'smooch_urls_to_ignore' || /^smooch_template_newsletter_header_/.test(field)) {
    Object.assign(otherProps, {
      rows: 5,
      rowsMax: Infinity,
      multiline: true,
    });
  }

  return (
    <TextField
      key={`${field}-${value}`}
      label={schema.title.replace('Smooch', 'Sunshine')}
      defaultValue={value || schema.default}
      className={classes.field}
      onBlur={(event) => {
        let newValue = event.target.value.trim();
        if (schema.type === 'number') {
          newValue = parseInt(newValue, 10);
        }
        handleChange(field, newValue);
      }}
      helperText={schema.description}
      variant="outlined"
      fullWidth
      inputProps={inputProps}
      {...otherProps}
    />
  );
};

SmoochBotSetting.propTypes = {
  field: PropTypes.object.isRequired,
  value: PropTypes.any.isRequired,
  schema: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SmoochBotSetting;
