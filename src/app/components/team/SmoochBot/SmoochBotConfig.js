import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { checkBlue, brandHighlight } from '../../../styles/js/shared';
import SmoochBotSidebar from './SmoochBotSidebar';
import SmoochBotTextEditor from './SmoochBotTextEditor';
import SmoochBotMultiTextEditor from './SmoochBotMultiTextEditor';
import SmoochBotMenuEditor from './SmoochBotMenuEditor';
import SmoochBotResourceEditor from './SmoochBotResourceEditor';
import SmoochBotNewsletterEditor from './SmoochBotNewsletterEditor';
import SmoochBotSettings from './SmoochBotSettings';
import SmoochBotContentAndTranslation from './SmoochBotContentAndTranslation';
import SmoochBotMainMenu from './SmoochBotMainMenu';
import { labels, descriptions, placeholders } from './localizables';

const useStyles = makeStyles(theme => ({
  title: {
    fontWeight: 'bold',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(1),
  },
  helpIcon: {
    color: checkBlue,
  },
  box: {
    padding: theme.spacing(2),
    paddingTop: theme.spacing(1),
  },
  resource: {
    color: brandHighlight,
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

  // Look for current selected resource
  let currentResource = null;
  if (/^resource_/.test(currentOption)) {
    const resourceIndex = parseInt(currentOption.replace(/^resource_/, ''), 10);
    if (value.smooch_workflows[currentWorkflowIndex].smooch_custom_resources) {
      currentResource = value.smooch_workflows[currentWorkflowIndex]
        .smooch_custom_resources[resourceIndex];
      if (!currentResource) {
        setCurrentOption('smooch_message_smooch_bot_greetings');
      }
    } else {
      setCurrentOption('smooch_message_smooch_bot_greetings');
    }
  }

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

  const handleAddResource = (currentValue, title, id) => {
    const updatedValue = JSON.parse(JSON.stringify(currentValue));
    if (!value.smooch_workflows[currentWorkflowIndex].smooch_custom_resources) {
      updatedValue.smooch_workflows[currentWorkflowIndex].smooch_custom_resources = [];
    }
    updatedValue.smooch_workflows[currentWorkflowIndex].smooch_custom_resources.push({
      smooch_custom_resource_id: id || Math.random().toString().substring(2, 10),
      smooch_custom_resource_title:
        title || props.intl.formatMessage(placeholders.default_new_resource_title),
      smooch_custom_resource_body: '',
      smooch_custom_resource_feed_url: '',
      smooch_custom_resource_number_of_articles: 3,
    });
    return updatedValue;
  };

  const handleChangeTextField = (newValue) => {
    const updatedValue = JSON.parse(JSON.stringify(value));
    updatedValue.smooch_workflows[currentWorkflowIndex][currentOption] = newValue;
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

  const handleChangeResource = (key, newValue) => {
    if (currentResource) {
      const updatedValue = JSON.parse(JSON.stringify(value));
      const resourceIndex = parseInt(currentOption.replace(/^resource_/, ''), 10);
      updatedValue.smooch_workflows[currentWorkflowIndex]
        .smooch_custom_resources[resourceIndex][key] = newValue;
      setValue(updatedValue);
    }
  };

  const handleDeleteResource = () => {
    if (currentResource) {
      const updatedValue = JSON.parse(JSON.stringify(value));
      const resourceIndex = parseInt(currentOption.replace(/^resource_/, ''), 10);
      updatedValue.smooch_workflows[currentWorkflowIndex]
        .smooch_custom_resources.splice(resourceIndex, 1);
      setValue(updatedValue);
      setCurrentOption('smooch_message_smooch_bot_greetings');
    }
  };

  const handleChangeNewsletter = (key, newValue) => {
    const updatedValue = JSON.parse(JSON.stringify(value));
    if (!updatedValue.smooch_workflows[currentWorkflowIndex].smooch_newsletter) {
      updatedValue.smooch_workflows[currentWorkflowIndex].smooch_newsletter = {};
    }
    updatedValue.smooch_workflows[currentWorkflowIndex].smooch_newsletter[key] = newValue;
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
                resources={value.smooch_workflows[currentWorkflowIndex].smooch_custom_resources}
                version={value.smooch_version || 'v1'}
                onClick={handleSelectOption}
              />
              <Button
                startIcon={<AddCircleOutlineIcon />}
                className={classes.resource}
                onClick={() => {
                  const updatedValue = handleAddResource(value);
                  setValue(updatedValue);
                  const resourcesCount = updatedValue.smooch_workflows[currentWorkflowIndex]
                    .smooch_custom_resources.length;
                  setCurrentOption(`resource_${resourcesCount - 1}`);
                }}
              >
                <FormattedMessage
                  id="smoochBot.addResource"
                  defaultMessage="Add resource"
                />
              </Button>
            </Box>
            <Box flexGrow="1" className={classes.box}>
              { currentOption === 'smooch_message_smooch_bot_no_action' ?
                <React.Fragment>
                  <Box m={1}>
                    <Typography variant="subtitle2" component="div">{labels[currentOption]}</Typography>
                    <Typography component="div">{descriptions[currentOption]}</Typography>
                  </Box>
                  <SmoochBotResourceEditor
                    installationId={props.installationId}
                    resource={value.smooch_workflows[currentWorkflowIndex][currentOption] || {}}
                    onChange={handleChangeMultiTextField}
                    hasTitle={false}
                  />
                </React.Fragment> : null }
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
                  resources={value.smooch_workflows[currentWorkflowIndex].smooch_custom_resources}
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
                  installationId={props.installationId}
                  resource={currentResource}
                  onChange={handleChangeResource}
                  onDelete={handleDeleteResource}
                /> : null }
              { currentOption === 'smooch_newsletter' ?
                <SmoochBotNewsletterEditor
                  installationId={props.installationId}
                  newsletter={value.smooch_workflows[currentWorkflowIndex].smooch_newsletter || {}}
                  newsletterInformation={props.newsletterInformation[currentLanguage]}
                  newsletterHeader={settings[`smooch_template_newsletter_header_${currentLanguage}`]}
                  onChange={handleChangeNewsletter}
                  teamName={props.teamName}
                /> : null }
              { currentOption === 'smooch_content' ?
                <SmoochBotContentAndTranslation
                  key={currentLanguage}
                  value={value.smooch_workflows[currentWorkflowIndex]}
                  onChangeMessage={handleChangeMessage}
                  onChangeStateMessage={handleChangeStateMessage}
                /> : null }
              { currentOption === 'smooch_main_menu' ?
                <SmoochBotMainMenu
                  key={currentLanguage}
                  languages={languages}
                  value={value.smooch_workflows[currentWorkflowIndex]}
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
          languages={languages}
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
  newsletterInformation: PropTypes.object.isRequired,
  teamName: PropTypes.string.isRequired,
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

export default injectIntl(SmoochBotConfig);
