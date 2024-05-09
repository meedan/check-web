import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import Box from '@material-ui/core/Box';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '../../cds/inputs/TextField';
import ClearIcon from '../../../icons/clear.svg';
import { placeholders } from './localizables';
import { languageLabel } from '../../../LanguageRegistry';

const useStyles = makeStyles(theme => ({
  paper: {
    width: '100%',
    boxShadow: 'none',
    border: '2px solid var(--brandMain)',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  box: {
    padding: theme.spacing(2),
  },
  ifTitle: {
    color: 'var(--brandMain)',
  },
  thenTitle: {
    color: 'var(--brandMain)',
  },
  caption: {
    margin: `0 ${theme.spacing(1)}px`,
  },
  button: {
    cursor: 'pointer',
  },
}));

const actionLabels = defineMessages({
  main_state: {
    id: 'smoochBotMenuOption.mainState',
    defaultMessage: 'Main menu',
  },
  secondary_state: {
    id: 'smoochBotMenuOption.secondaryState',
    defaultMessage: 'Secondary menu',
  },
  query_state: {
    id: 'smoochBotMenuOption.queryState',
    defaultMessage: 'Query prompt',
  },
  resource: {
    id: 'smoochBotMenuOption.resource',
    defaultMessage: 'Report',
  },
  language: {
    id: 'smoochBotMenuOption.languageAction',
    defaultMessage: '{languageName} (main menu)',
  },
  subscription_state: {
    id: 'smoochBotMenuOption.subscription',
    defaultMessage: 'Subscription opt-in',
  },
  subscription_confirmation: {
    id: 'smoochBotMenuOption.subscriptionConfirmation',
    defaultMessage: 'Subscription confirmation',
  },
});

function keywordIsInvalid(field, keyword) {
  // Number 9 is a reserved keyword for the main menu - it returns the TOS
  return field === 'smooch_state_main' &&
    keyword.trim().split(',').find(k => parseInt(k.trim(), 10) === 9);
}

const SmoochBotMenuOption = (props) => {
  const classes = useStyles();
  const { option } = props;
  const [error, setError] = React.useState(keywordIsInvalid(
    props.field,
    option.smooch_menu_option_keyword,
  ));

  const handleChangeKeywords = (event) => {
    const { value } = event.target;
    setError(keywordIsInvalid(props.field, value));
    props.onChange({ smooch_menu_option_keyword: value });
  };

  const resourceIdToTitle = (uuid) => {
    const resource = props.resources.find(r => r.uuid === uuid);
    if (resource) {
      return resource.title;
    }
    return null;
  };

  const handleSelectAction = (event, newValue) => {
    if (newValue.value === 'custom_resource') {
      props.onChange({
        smooch_menu_option_value: 'custom_resource',
        smooch_menu_custom_resource_id: newValue.id,
      });
    } else {
      props.onChange({ smooch_menu_option_value: newValue.value });
    }
  };

  const handleClear = () => {
    props.onChange({
      smooch_menu_project_media_title: '',
      smooch_menu_project_media_id: '',
      smooch_menu_option_value: '',
      smooch_menu_custom_resource_id: '',
    });
  };

  const filter = createFilterOptions();
  const menuOptions = [];
  props.menuActions.forEach((action) => {
    if (action.key !== 'custom_resource') {
      menuOptions.push({
        title: props.intl.formatMessage(actionLabels[action.key]),
        value: action.key,
      });
    }
  });
  if (props.field !== 'smooch_state_subscription') {
    props.languages.forEach((languageCode) => {
      menuOptions.push({
        title: props.intl.formatMessage(
          actionLabels.language,
          { languageName: languageLabel(languageCode) },
        ),
        value: languageCode,
      });
    });
    props.resources.forEach((resource) => {
      menuOptions.push({
        title: resource.title,
        id: resource.uuid,
        value: 'custom_resource',
      });
    });
  }

  return (
    <Paper className={classes.paper}>
      <Box display="flex">
        <Box flex="1" className={classes.box}>
          <Box display="flex" alignItems="center">
            <div className={['typography-subtitle1', classes.title, classes.ifTitle].join(' ')}>
              <FormattedMessage
                id="smoochBotMenuOption.if"
                defaultMessage="If"
                description="Logical operator IF statement"
              />
            </div>
            <div className={['typography-caption', classes.caption].join(' ')}>
              <FormattedMessage
                id="smoochBotMenuOption.condition"
                defaultMessage="The following keyword is matched"
                description="Label for keyword matching rule"
              />
            </div>
          </Box>
          <TextField
            key={Math.random().toString().substring(2, 10)}
            defaultValue={option.smooch_menu_option_keyword}
            onBlur={handleChangeKeywords}
            placeholder={props.intl.formatMessage(placeholders.menu_keywords)}
            variant="outlined"
            disabled={props.readOnly}
            helperText={
              option.smooch_menu_option_value !== 'tos' && error ?
                <FormattedMessage
                  id="smoochBotMenuOption.errorTos"
                  defaultMessage="'9' will redirect to the terms of service. It cannot be used as an option in the main menu."
                  description="Help text for an text field input"
                /> : null
            }
            error={option.smooch_menu_option_value !== 'tos' && error}
          />
        </Box>
        <Box flex="1" className={classes.box}>
          <Box display="flex" alignItems="center">
            <div className={['typography-subtitle1', classes.title, classes.thenTitle].join(' ')}>
              <FormattedMessage
                id="smoochBotMenuOption.then"
                defaultMessage="Then"
                description="Logical operator THEN statement"
              />
            </div>
            <div className={['typography-caption', classes.caption].join(' ')}>
              <FormattedMessage
                id="smoochBotMenuOption.action"
                defaultMessage="Respond with"
                description="Label for the field describing how the bot should respond"
              />
            </div>
          </Box>
          { option.smooch_menu_option_value === 'tos' ?
            <TextField
              key="tos"
              placeholder={
                props.intl.formatMessage(placeholders.tos, {
                  language: languageLabel(props.currentLanguage),
                })
              }
              variant="outlined"
              fullWidth
              disabled
            /> : null }
          { option.smooch_menu_option_value === 'resource' ?
            <TextField
              key={option.smooch_menu_project_media_id}
              defaultValue={option.smooch_menu_project_media_title}
              InputProps={{
                endAdornment: (
                  <InputAdornment onClick={handleClear} className={classes.button}>
                    <ClearIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              fullWidth
              disabled
            /> : null }
          { option.smooch_menu_option_value === 'custom_resource' && resourceIdToTitle(option.smooch_menu_custom_resource_id) ?
            <TextField
              key={option.smooch_menu_custom_resource_id}
              defaultValue={resourceIdToTitle(option.smooch_menu_custom_resource_id)}
              InputProps={{
                endAdornment: (
                  <InputAdornment onClick={handleClear} className={classes.button}>
                    <ClearIcon />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              fullWidth
              disabled
            /> : null }
          { (option.smooch_menu_option_value !== 'custom_resource' || !resourceIdToTitle(option.smooch_menu_custom_resource_id)) && option.smooch_menu_option_value !== 'resource' && option.smooch_menu_option_value !== 'tos' ?
            <Autocomplete
              value={option.smooch_menu_option_value}
              onChange={handleSelectAction}
              filterOptions={(options, params) => {
                const filtered = filter(options, params);

                // Suggest the creation of a new value
                if (params.inputValue !== '') {
                  filtered.push({
                    inputValue: params.inputValue,
                    title: (
                      <FormattedMessage
                        id="smoochBotMenuOption.add"
                        defaultMessage='Create "{resourceName}"'
                        description="Suggestion for creating a new resource of the name listed"
                        values={{ resourceName: params.inputValue }}
                      />
                    ),
                  });
                }

                return filtered;
              }}
              selectOnFocus
              clearOnBlur
              options={menuOptions}
              getOptionLabel={(opt) => {
                // Value selected from the options
                if (typeof opt === 'string' && opt !== '') {
                  if (Object.keys(actionLabels).indexOf(opt) > -1) {
                    return props.intl.formatMessage(actionLabels[opt]);
                  }
                  if (opt === 'custom_resource') { // Deleted resource
                    return '';
                  }
                  return props.intl.formatMessage(
                    actionLabels.language,
                    { languageName: languageLabel(opt) },
                  );
                }
                // Add option created dynamically
                if (opt.inputValue) {
                  return opt.inputValue;
                }
                // Regular option
                return opt.title;
              }}
              renderOption={opt => opt.title}
              freeSolo
              renderInput={params => (
                <TextField
                  {...params}
                  label={
                    <FormattedMessage
                      id="smoochBotMenuOption.selectMessage"
                      defaultMessage="Select message"
                      description="Text field label to select a message to send"
                    />
                  }
                  variant="outlined"
                  fullWidth
                />
              )}
            /> : null }
        </Box>
      </Box>
    </Paper>
  );
};

SmoochBotMenuOption.defaultProps = {
  resources: [],
  readOnly: false,
  currentLanguage: '',
};

SmoochBotMenuOption.propTypes = {
  languages: PropTypes.arrayOf(PropTypes.string).isRequired,
  menuActions: PropTypes.arrayOf(PropTypes.object).isRequired,
  option: PropTypes.object.isRequired,
  resources: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func.isRequired,
  field: PropTypes.string.isRequired,
  currentLanguage: PropTypes.string,
  readOnly: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(SmoochBotMenuOption);
