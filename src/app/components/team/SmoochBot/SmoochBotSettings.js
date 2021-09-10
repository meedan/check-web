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
import SmoochBotIntegrations from './SmoochBotIntegrations';

const useStyles = makeStyles(theme => ({
  field: {
    marginTop: theme.spacing(2),
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
  // Facebook and Twitter authorization URLs are rendered as buttons on the top, not form fields
  const shouldHide = (field) => {
    if (field === 'smooch_facebook_authorization_url' || field === 'smooch_twitter_authorization_url') {
      return true;
    }
    const whitelist = ['smooch_disabled', 'smooch_project_id', 'smooch_urls_to_ignore'];
    if (whitelist.indexOf(field) > -1 || props.currentUser.is_admin) {
      return false;
    }
    return true;
  };

  return (
    <React.Fragment>
      <SmoochBotIntegrations
        settings={props.settings}
        schema={props.schema}
        enabledIntegrations={props.enabledIntegrations}
        installationId={props.installationId}
      />

      {Object.keys(props.schema).map((field) => {
        const value = props.settings[field];
        const schema = props.schema[field];

        if (shouldHide(field)) {
          return null;
        }

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
          inputProps.step = 5;
          inputProps.min = 10;
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
            helperText={schema.description}
            variant="outlined"
            fullWidth
            inputProps={inputProps}
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
  onChange: PropTypes.func.isRequired,
  enabledIntegrations: PropTypes.object.isRequired,
  installationId: PropTypes.string.isRequired,
};

export default SmoochBotSettings;
