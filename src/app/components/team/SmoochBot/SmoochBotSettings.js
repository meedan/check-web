import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import WhatsAppIcon from '@material-ui/icons/WhatsApp';
import TwitterIcon from '@material-ui/icons/Twitter';
import FacebookIcon from '@material-ui/icons/Facebook';
import { whatsappGreen, twitterBlue, facebookBlue } from '../../../styles/js/shared';

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
  smoochBotSocialButton: {
    color: 'white',
    margin: theme.spacing(1),
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

  const handleConnectToTwitter = () => {
    window.open(props.settings.smooch_twitter_authorization_url);
  };

  const handleConnectToFacebook = () => {
    window.open(props.settings.smooch_facebook_authorization_url);
  };

  const handleConnectToWhatsApp = () => {
    window.open('https://airtable.com/shrAhYXEFGe7F9QHr');
  };

  const isSmoochSet = props.settings.smooch_app_id && props.settings.smooch_secret_key_key_id && props.settings.smooch_secret_key_secret && props.settings.smooch_webhook_secret;

  return (
    <React.Fragment>
      <Box display="flex" justifyContent="center" mt={2}>
        <Button
          variant="contained"
          style={{ backgroundColor: whatsappGreen }}
          startIcon={<WhatsAppIcon />}
          onClick={handleConnectToWhatsApp}
          className={classes.smoochBotSocialButton}
        >
          <FormattedMessage
            id="smoochBotSettings.connectToWhatsApp"
            defaultMessage="Connect to WhatsApp"
          />
        </Button>

        { props.schema.smooch_twitter_authorization_url ?
          <Button
            variant="contained"
            style={{ backgroundColor: twitterBlue }}
            startIcon={<TwitterIcon />}
            onClick={handleConnectToTwitter}
            className={classes.smoochBotSocialButton}
            disabled={!isSmoochSet}
          >
            <FormattedMessage
              id="smoochBotSettings.connectToTwitter"
              defaultMessage="Connect to Twitter"
            />
          </Button> : null }

        { props.schema.smooch_facebook_authorization_url ?
          <Button
            variant="contained"
            style={{ backgroundColor: facebookBlue }}
            startIcon={<FacebookIcon />}
            onClick={handleConnectToFacebook}
            className={classes.smoochBotSocialButton}
            disabled={!isSmoochSet}
          >
            <FormattedMessage
              id="smoochBotSettings.connectToFacebook"
              defaultMessage="Connect to Facebook"
            />
          </Button> : null }
      </Box>
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
