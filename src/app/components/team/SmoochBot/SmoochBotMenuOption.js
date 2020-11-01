import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Autocomplete, { createFilterOptions } from '@material-ui/lab/Autocomplete';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import ClearIcon from '@material-ui/icons/Clear';
import InputAdornment from '@material-ui/core/InputAdornment';
import SmoochBotSelectReport from './SmoochBotSelectReport';
import { placeholders } from './localizables';
import { languageLabel } from '../../../LanguageRegistry';
import { checkBlue, inProgressYellow } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  paper: {
    width: '100%',
    boxShadow: 'none',
    border: `2px solid ${inProgressYellow}`,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  box: {
    padding: theme.spacing(2),
  },
  ifTitle: {
    color: inProgressYellow,
  },
  thenTitle: {
    color: checkBlue,
  },
  title: {
    textTransform: 'uppercase',
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
});

const SmoochBotMenuOption = (props) => {
  const classes = useStyles();
  const { option } = props;
  const [showReportDialog, setShowReportDialog] = React.useState(false);

  const handleChangeKeywords = (event) => {
    props.onChange({ smooch_menu_option_keyword: event.target.value });
  };

  const resourceIdToTitle = (id) => {
    const resource = props.resources.find(r => r.smooch_custom_resource_id === id);
    if (resource) {
      return resource.smooch_custom_resource_title;
    }
    return null;
  };

  const handleSelectAction = (event, newValue) => {
    if (newValue.value === 'resource') {
      setShowReportDialog(true);
    } else if (newValue && newValue.inputValue) {
      props.onChange({
        smooch_menu_option_value: 'custom_resource',
        smooch_menu_custom_resource_title: newValue.inputValue,
        smooch_menu_custom_resource_id: Math.random().toString().substring(2, 10),
      });
    } else if (newValue.value === 'custom_resource') {
      props.onChange({
        smooch_menu_option_value: 'custom_resource',
        smooch_menu_custom_resource_id: newValue.id,
      });
    } else {
      props.onChange({ smooch_menu_option_value: newValue.value });
    }
  };

  const handleSelectReport = (report) => {
    props.onChange({
      smooch_menu_option_value: 'resource',
      smooch_menu_project_media_title: report.text,
      smooch_menu_project_media_id: report.value,
    });
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
      title: resource.smooch_custom_resource_title,
      id: resource.smooch_custom_resource_id,
      value: 'custom_resource',
    });
  });

  return (
    <Paper className={classes.paper}>
      <Box display="flex">
        <Box flex="1" className={classes.box}>
          <Box display="flex" alignItems="center">
            <Typography className={[classes.title, classes.ifTitle].join(' ')} component="div" variant="subtitle1">
              <FormattedMessage
                id="smoochBotMenuOption.if"
                defaultMessage="If"
              />
            </Typography>
            <Typography component="div" variant="caption" className={classes.caption}>
              <FormattedMessage
                id="smoochBotMenuOption.condition"
                defaultMessage="The following keyword is matched"
              />
            </Typography>
          </Box>
          <TextField
            key={Math.random().toString().substring(2, 10)}
            defaultValue={option.smooch_menu_option_keyword}
            onBlur={handleChangeKeywords}
            placeholder={props.intl.formatMessage(placeholders.menu_keywords)}
            variant="outlined"
            fullWidth
          />
        </Box>
        <Box flex="1" className={classes.box}>
          <Box display="flex" alignItems="center">
            <Typography className={[classes.title, classes.thenTitle].join(' ')} component="div" variant="subtitle1">
              <FormattedMessage
                id="smoochBotMenuOption.then"
                defaultMessage="Then"
              />
            </Typography>
            <Typography component="div" variant="caption" className={classes.caption}>
              <FormattedMessage
                id="smoochBotMenuOption.action"
                defaultMessage="Respond with"
              />
            </Typography>
          </Box>
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
          { (option.smooch_menu_option_value !== 'custom_resource' || !resourceIdToTitle(option.smooch_menu_custom_resource_id)) && option.smooch_menu_option_value !== 'resource' ?
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
                    />
                  }
                  variant="outlined"
                  fullWidth
                />
              )}
            /> : null }
        </Box>
      </Box>
      { showReportDialog ?
        <SmoochBotSelectReport
          onSelect={(resource) => {
            handleSelectReport(resource);
            setShowReportDialog(false);
          }}
          onDismiss={() => {
            setShowReportDialog(false);
          }}
        /> : null }
    </Paper>
  );
};

SmoochBotMenuOption.defaultProps = {
  resources: [],
};

SmoochBotMenuOption.propTypes = {
  languages: PropTypes.arrayOf(PropTypes.string).isRequired,
  menuActions: PropTypes.arrayOf(PropTypes.object).isRequired,
  option: PropTypes.object.isRequired,
  resources: PropTypes.arrayOf(PropTypes.object),
  onChange: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(SmoochBotMenuOption);
