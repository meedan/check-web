import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import TextField from '../../cds/inputs/TextField';
import Chip from '../../cds/buttons-checkboxes-chips/Chip';
import inputStyles from '../../../styles/css/inputs.module.css';

const SmoochBotSetting = (props) => {
  const { field, schema, value } = props;

  const handleChange = (key, newValue) => {
    props.onChange(key, newValue);
  };

  if (schema.type === 'boolean') {
    return (
      <SwitchComponent
        checked={value || schema.default}
        helperContent={schema.description}
        key={`${field}-${value}`}
        label={schema.title}
        labelPlacement="end"
        onChange={(event) => { handleChange(field, event); }}
      />
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
                <Chip className={inputStyles['select-chip']} key={selectedValue} label={selectedValue} />
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
      className={inputStyles['form-fieldset-field']}
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
