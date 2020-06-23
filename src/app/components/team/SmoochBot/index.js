import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import HelpIcon from '@material-ui/icons/HelpOutline';
import Box from '@material-ui/core/Box';
import { checkBlue } from '../../../styles/js/shared';
import LanguageSwitcher from '../../LanguageSwitcher';
import SmoochBotSidebar from './SmoochBotSidebar';
import SmoochBotTextEditor from './SmoochBotTextEditor';
import SmoochBotMenuEditor from './SmoochBotMenuEditor';
import SmoochBotSettings from './SmoochBotSettings';
import { placeholders } from './localizables';

const useStyles = makeStyles(theme => ({
  title: {
    fontWeight: 'bold',
  },
  helpIcon: {
    color: checkBlue,
  },
  box: {
    padding: theme.spacing(2),
  },
}));

const SmoochBot = (props) => {
  const classes = useStyles();

  const [currentTab, setCurrentTab] = React.useState(0);
  const defaultLanguage = props.team.get_language || 'en';
  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage);
  const [currentOption, setCurrentOption] = React.useState('smooch_message_smooch_bot_greetings');

  const { value } = props;

  // Look for the workflow in the current selected language
  let currentWorkflowIndex = 0;
  value.smooch_workflows.forEach((workflow, index) => {
    if (workflow.smooch_workflow_language === currentLanguage) {
      currentWorkflowIndex = index;
    }
  });

  const languages = props.team.get_languages ? JSON.parse(props.team.get_languages) : ['en'];

  const menuActions = props.schema.properties.smooch_workflows.items.properties.smooch_state_main
    .properties.smooch_menu_options.items.properties.smooch_menu_option_value.enum;

  const settings = Object.assign({}, value);
  delete settings.smooch_workflows;
  const settingsSchema = Object.assign({}, props.schema.properties);
  delete settingsSchema.smooch_workflows;

  const setValue = (newValue) => {
    props.onChange(newValue);
  };

  const handleChangeTab = (event, newTab) => {
    setCurrentTab(newTab);
  };

  const handleHelp = () => {
    window.open('https://help.checkmedia.org/en/articles/3872445-create-your-bot');
  };

  const handleChangeLanguage = (newValue) => {
    // If there is no workflow for this language, create a new, empty one
    if (value.smooch_workflows.filter(w => w.smooch_workflow_language === newValue).length === 0) {
      const updatedValue = JSON.parse(JSON.stringify(value));
      updatedValue.smooch_workflows.push({
        smooch_workflow_language: newValue,
        smooch_message_smooch_bot_result_changed:
          props.intl.formatMessage(placeholders.smooch_message_smooch_bot_result_changed),
        smooch_message_smooch_bot_message_confirmed:
          props.intl.formatMessage(placeholders.smooch_message_smooch_bot_message_confirmed),
        smooch_message_smooch_bot_message_type_unsupported:
          props.intl.formatMessage(placeholders.smooch_message_smooch_bot_message_type_unsupported),
        smooch_message_smooch_bot_disabled:
          props.intl.formatMessage(placeholders.smooch_message_smooch_bot_disabled),
        smooch_message_smooch_bot_ask_for_tos:
          props.intl.formatMessage(placeholders.smooch_message_smooch_bot_ask_for_tos),
        smooch_message_smooch_bot_greetings:
          props.intl.formatMessage(placeholders.smooch_message_smooch_bot_greetings),
        smooch_message_smooch_bot_option_not_available:
          props.intl.formatMessage(placeholders.smooch_message_smooch_bot_option_not_available),
        smooch_state_main: {
          smooch_menu_message: props.intl.formatMessage(placeholders.smooch_state_main),
          smooch_menu_options: [],
        },
        smooch_state_secondary: {
          smooch_menu_message: props.intl.formatMessage(placeholders.smooch_state_secondary),
          smooch_menu_options: [],
        },
        smooch_state_query: {
          smooch_menu_message: props.intl.formatMessage(placeholders.smooch_state_query),
          smooch_menu_options: [],
        },
      });
      setValue(updatedValue);
    }
    setCurrentLanguage(newValue);
  };

  const handleSelectOption = (option) => {
    setCurrentOption(option);
  };

  const handleChangeTextField = (newValue) => {
    const updatedValue = JSON.parse(JSON.stringify(value));
    updatedValue.smooch_workflows[currentWorkflowIndex][currentOption] = newValue;
    setValue(updatedValue);
  };

  const handleChangeMenu = (newValue) => {
    const updatedValue = JSON.parse(JSON.stringify(value));
    if (!updatedValue.smooch_workflows[currentWorkflowIndex][currentOption]) {
      updatedValue.smooch_workflows[currentWorkflowIndex][currentOption] = {};
    }
    Object.assign(updatedValue.smooch_workflows[currentWorkflowIndex][currentOption], newValue);
    setValue(updatedValue);
  };

  const handleUpdateSetting = (key, newValue) => {
    const updatedValue = JSON.parse(JSON.stringify(value));
    updatedValue[key] = newValue;
    setValue(updatedValue);
  };

  return (
    <React.Fragment>
      <Tabs value={currentTab} onChange={handleChangeTab} variant="fullWidth">
        <Tab label={<FormattedMessage id="smoochBot.scenarios" defaultMessage="Scenarios" />} />
        <Tab label={<FormattedMessage id="smoochBot.settings" defaultMessage="Settings" />} />
      </Tabs>
      { currentTab === 0 ?
        <React.Fragment>
          <LanguageSwitcher
            primaryLanguage={defaultLanguage}
            currentLanguage={currentLanguage || 'en'}
            languages={languages}
            onChange={handleChangeLanguage}
          />
          <Box display="flex" alignItems="center">
            <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
              <FormattedMessage
                id="smoochBot.title"
                defaultMessage="Design your bot"
              />
            </Typography>
            <IconButton onClick={handleHelp}>
              <HelpIcon className={classes.helpIcon} />
            </IconButton>
          </Box>
          <Box display="flex">
            <SmoochBotSidebar currentOption={currentOption} onClick={handleSelectOption} />
            <Box flexGrow="1" className={classes.box}>
              { /^smooch_message_smooch_bot_/.test(currentOption) ?
                <SmoochBotTextEditor
                  value={value.smooch_workflows[currentWorkflowIndex][currentOption]}
                  onChange={handleChangeTextField}
                  field={currentOption}
                /> : null }
              { /^smooch_state_/.test(currentOption) ?
                <SmoochBotMenuEditor
                  languages={languages}
                  field={currentOption}
                  value={value.smooch_workflows[currentWorkflowIndex][currentOption]}
                  menuActions={menuActions}
                  onChange={handleChangeMenu}
                /> : null }
            </Box>
          </Box>
        </React.Fragment> : null }
      { currentTab === 1 ?
        <SmoochBotSettings
          settings={settings}
          schema={settingsSchema}
          onChange={handleUpdateSetting}
        /> : null }
    </React.Fragment>
  );
};

SmoochBot.propTypes = {
  team: PropTypes.object.isRequired,
  value: PropTypes.object.isRequired, // saved settings for the Smooch Bot
  onChange: PropTypes.func.isRequired, // called after "save" is clicked
  schema: PropTypes.object.isRequired,
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

export default injectIntl(SmoochBot);
