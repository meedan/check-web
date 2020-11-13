import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
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
  checkbox: {
    marginBottom: theme.spacing(2),
  },
  chip: {
    margin: `0 ${theme.spacing(1)}px 0 ${theme.spacing(1)}px`,
  },
}));

const SmoochBotSettings = (props) => {
  const classes = useStyles();

  const handleChange = (key, value) => {
    props.onChange(key, value);
  };

  // Some critical settings fields should be available only to admins
  const shouldHide = (field) => {
    const whitelist = ['smooch_disabled', 'smooch_project_id', 'smooch_urls_to_ignore'];
    if (whitelist.indexOf(field) > -1 || props.currentUser.is_admin) {
      return false;
    }
    return true;
  };

  return (
    <React.Fragment>
      {Object.keys(props.schema).map((field) => {
        const value = props.settings[field];
        const schema = props.schema[field];

        if (shouldHide(field)) {
          return null;
        }

        if (schema.type === 'boolean') {
          return (
            <FormControlLabel
              key={`${field}-${value}`}
              className={classes.checkbox}
              control={
                <Checkbox
                  defaultChecked={value || schema.default}
                  onChange={(event) => { handleChange(field, event.target.checked); }}
                />
              }
              label={schema.title}
            />
          );
        }

        if (schema.type === 'array') {
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
                {schema.items.enum.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        }

        const otherProps = {};

        if (schema.type === 'readonly') {
          otherProps.disabled = true;
        }

        if (schema.type === 'number') {
          otherProps.type = 'number';
        }

        if (field === 'smooch_urls_to_ignore') {
          Object.assign(otherProps, {
            rows: 5,
            rowsMax: Infinity,
            multiline: true,
          });
        }

        return (
          <TextField
            key={`${field}-${value}`}
            label={schema.title}
            defaultValue={value || schema.default}
            className={classes.field}
            onBlur={(event) => {
              let newValue = event.target.value;
              if (schema.type === 'number') {
                newValue = parseInt(newValue, 10);
              }
              handleChange(field, newValue);
            }}
            variant="outlined"
            fullWidth
            {...otherProps}
          />
        );
      })}
    </React.Fragment>
  );
};

SmoochBotSettings.propTypes = {
  settings: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
};

export default SmoochBotSettings;
