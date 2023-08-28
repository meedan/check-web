/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Box from '@material-ui/core/Box';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import SmoochBotSidebar from './SmoochBotSidebar';
import SmoochBotTextEditor from './SmoochBotTextEditor';
import SmoochBotMultiTextEditor from './SmoochBotMultiTextEditor';
import SmoochBotMenuEditor from './SmoochBotMenuEditor';
import SmoochBotResourceEditor from './SmoochBotResourceEditor';
import SmoochBotSettings from './SmoochBotSettings';
import SmoochBotContentAndTranslation from './SmoochBotContentAndTranslation';
import SmoochBotMainMenu from './SmoochBotMainMenu';
import AddCircleIcon from '../../../icons/add_circle.svg';

const useStyles = makeStyles(theme => ({
  box: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
}));

const SmoochBotConfig = (props) => {
  const classes = useStyles();

  const {
    currentLanguage,
    languages,
    userRole,
    value,
  } = props;
  const [currentTab, setCurrentTab] = React.useState(0);
  const [currentOption, setCurrentOption] = React.useState(value.smooch_version === 'v2' ? 'smooch_content' : 'smooch_message_smooch_bot_greetings');

  // Look for the workflow in the current selected language
  let currentWorkflowIndex = 0;
  value.smooch_workflows.forEach((workflow, index) => {
    if (workflow.smooch_workflow_language === currentLanguage) {
      currentWorkflowIndex = index;
    }
  });

  // FIXME: Set currentResource if the current selected option on the left sidebar is a resource
  const currentResource = null;

  // FIXME: Get resources from the backend
  const resources = [];

  const menuActions = state => props.schema.properties.smooch_workflows.items.properties[state]
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

  const handleSelectOption = (option) => {
    setCurrentOption(option);
  };

  const handleChangeTextField = (newValue) => {
    const updatedValue = JSON.parse(JSON.stringify(value));
    updatedValue.smooch_workflows[currentWorkflowIndex][currentOption] = newValue;
    setValue(updatedValue);
  };

  const handleChangeImage = (file) => {
    const updatedValue = Object.assign({}, value);
    if (file) {
      updatedValue.smooch_workflows[currentWorkflowIndex].smooch_greeting_image = file;
    } else {
      updatedValue.smooch_workflows[currentWorkflowIndex].smooch_greeting_image = 'none';
    }
    setValue(updatedValue);
  };

  const handleChangeMessage = (stringId, newValue) => {
    const updatedValue = JSON.parse(JSON.stringify(value));
    updatedValue.smooch_workflows[currentWorkflowIndex][stringId] = newValue;
    setValue(updatedValue);
  };

  const handleChangeStateMessage = (state, newValue) => {
    const updatedValue = JSON.parse(JSON.stringify(value));
    const option = `smooch_state_${state}`;
    if (!updatedValue.smooch_workflows[currentWorkflowIndex][option]) {
      updatedValue.smooch_workflows[currentWorkflowIndex][option] = {};
    }
    updatedValue.smooch_workflows[currentWorkflowIndex][option].smooch_menu_message = newValue;
    setValue(updatedValue);
  };

  const handleChangeMultiTextField = (subKey, newValue) => {
    const updatedValue = JSON.parse(JSON.stringify(value));
    if (!updatedValue.smooch_workflows[currentWorkflowIndex][currentOption]) {
      updatedValue.smooch_workflows[currentWorkflowIndex][currentOption] = {};
    }
    updatedValue.smooch_workflows[currentWorkflowIndex][currentOption][subKey] = newValue;
    setValue(updatedValue);
  };

  const handleChangeMenu = (newValue, menuOption) => {
    let menu = menuOption;
    if (!menuOption) {
      menu = currentOption;
    }
    const updatedValue = JSON.parse(JSON.stringify(value));
    if (!updatedValue.smooch_workflows[currentWorkflowIndex][menu]) {
      updatedValue.smooch_workflows[currentWorkflowIndex][menu] = {};
    }
    Object.assign(updatedValue.smooch_workflows[currentWorkflowIndex][menu], newValue);
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
        <Tab label={<FormattedMessage id="smoochBot.designYourBot" defaultMessage="Design your bot" description="Title of tipline settings page" />} />
        { userRole === 'admin' ?
          <Tab label={<FormattedMessage id="smoochBot.settings" defaultMessage="Settings" />} />
          : null
        }
      </Tabs>
      { currentTab === 0 ?
        <React.Fragment>
          <Box display="flex">
            <Box>
              <SmoochBotSidebar
                currentOption={currentOption}
                resources={resources}
                version={value.smooch_version || 'v1'}
                onClick={handleSelectOption}
              />
              <ButtonMain
                iconLeft={<AddCircleIcon />}
                theme="brand"
                size="default"
                variant="text"
                onClick={() => {
                  // FIXME: Implement action to add a resource
                }}
                label={
                  <FormattedMessage
                    id="smoochBot.addResource"
                    defaultMessage="Add resource"
                  />
                }
              />
            </Box>
            <Box flexGrow="1" className={classes.box}>
              { currentOption === 'smooch_message_smooch_bot_tos' ?
                <SmoochBotMultiTextEditor
                  value={value.smooch_workflows[currentWorkflowIndex][currentOption]}
                  onChange={handleChangeMultiTextField}
                  subSchema={
                    props.schema.properties.smooch_workflows.items.properties[currentOption]
                  }
                  field={currentOption}
                  currentLanguage={currentLanguage}
                /> : null }
              { /^smooch_message_smooch_bot_/.test(currentOption) && currentOption !== 'smooch_message_smooch_bot_tos' && currentOption !== 'smooch_message_smooch_bot_no_action' ?
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
                  resources={resources}
                  menuActions={menuActions(currentOption)}
                  onChange={handleChangeMenu}
                  currentLanguage={currentLanguage}
                  textHeader={
                    currentOption === 'smooch_state_subscription' ?
                      <FormattedMessage
                        id="smoochBotConfig.subscriptionHeader"
                        defaultMessage="You are currently {subscription_status} to our newsletter."
                      /> : null
                  }
                /> : null }
              { currentResource ?
                <SmoochBotResourceEditor
                  key={currentResource.id}
                  resource={currentResource}
                /> : null }
              { currentOption === 'smooch_content' ?
                <SmoochBotContentAndTranslation
                  key={currentLanguage}
                  value={value.smooch_workflows[currentWorkflowIndex]}
                  onChangeImage={handleChangeImage}
                  onChangeMessage={handleChangeMessage}
                  onChangeStateMessage={handleChangeStateMessage}
                /> : null }
              { currentOption === 'smooch_main_menu' ?
                <SmoochBotMainMenu
                  key={currentLanguage}
                  languages={languages.filter(f => f !== currentLanguage)}
                  value={value.smooch_workflows[currentWorkflowIndex]}
                  enabledIntegrations={props.enabledIntegrations}
                  onChange={handleChangeMenu}
                /> : null }
            </Box>
          </Box>
        </React.Fragment> : null }
      { currentTab === 1 ?
        <SmoochBotSettings
          settings={settings}
          schema={settingsSchema}
          currentUser={props.currentUser}
          onChange={handleUpdateSetting}
          enabledIntegrations={props.enabledIntegrations}
          installationId={props.installationId}
        /> : null }
    </React.Fragment>
  );
};

SmoochBotConfig.propTypes = {
  installationId: PropTypes.string.isRequired,
  value: PropTypes.object.isRequired, // saved settings for the Smooch Bot
  onChange: PropTypes.func.isRequired, // called after "save" is clicked
  schema: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  userRole: PropTypes.string.isRequired,
  enabledIntegrations: PropTypes.object.isRequired,
};

export default SmoochBotConfig;
