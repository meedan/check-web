import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import SmoochBotSidebar from './SmoochBotSidebar';
import SmoochBotResourceEditor from './SmoochBotResourceEditor';
import SmoochBotSettings from './SmoochBotSettings';
import SmoochBotContentAndTranslation from './SmoochBotContentAndTranslation';
import SmoochBotMainMenu from './SmoochBotMainMenu';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import AddIcon from '../../../icons/add.svg';
import createEnvironment from '../../../relay/EnvironmentModern';
import styles from '../Settings.module.css';

const SmoochBotConfig = (props) => {
  const {
    currentLanguage,
    hasUnsavedChanges,
    languages,
    onEditingResource,
    resources,
    userRole,
    value,
  } = props;
  const defaultOption = 'smooch_content';
  const [currentOption, setCurrentOption] = React.useState(defaultOption);
  const team = props?.currentUser?.current_team;
  const environment = createEnvironment(props?.currentUser?.token, team.slug);

  // Look for the workflow in the current selected language
  let currentWorkflowIndex = 0;
  value.smooch_workflows.forEach((workflow, index) => {
    if (workflow.smooch_workflow_language === currentLanguage) {
      currentWorkflowIndex = index;
    }
  });

  const handleSelectOption = (option) => {
    if (/^resource_/.test(option)) {
      onEditingResource(true);
    } else {
      onEditingResource(false);
    }
    setCurrentOption(option);
  };

  // Set currentResource if the current selected option on the left sidebar is a resource
  let currentResource = null;
  if (/^resource_/.test(currentOption)) {
    const resource_id = currentOption.match(/^resource_(.+)$/)[1];
    // New resource
    if (resource_id === 'new') {
      currentResource = {
        uuid: Math.random().toString().substring(2, 10),
        language: currentLanguage,
        content_type: 'static',
        header_type: 'link_preview',
        number_of_articles: 0,
      };
    } else {
      currentResource = resources.find(resource => resource.dbid === parseInt(resource_id, 10));
    }
    if (!currentResource) {
      handleSelectOption(defaultOption);
    }
  }

  const settings = Object.assign({}, value);
  delete settings.smooch_workflows;
  const settingsSchema = Object.assign({}, props.schema.properties);
  delete settingsSchema.smooch_workflows;

  const setValue = (newValue) => {
    props.onChange(newValue);
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
      <React.Fragment>
        <div className={styles['bot-designer']}>
          <div className={styles['bot-designer-menu']}>
            <SmoochBotSidebar
              currentOption={currentOption}
              resources={resources}
              userRole={userRole}
              onClick={handleSelectOption}
            />
            <ButtonMain
              iconLeft={<AddIcon />}
              label={
                <FormattedMessage
                  defaultMessage="New Tipline Resource"
                  description="Button label to add a resource to this bot"
                  id="smoochBot.addResource"
                />
              }
              size="default"
              theme="text"
              variant="contained"
              onClick={() => {
                handleSelectOption('resource_new');
              }}
            />
          </div>
          <div className={styles['bot-designer-content']}>
            { currentResource ?
              <SmoochBotResourceEditor
                environment={environment}
                key={currentResource.id}
                language={currentLanguage}
                resource={currentResource}
                onCreate={(newResource) => { handleSelectOption(`resource_${newResource.dbid}`); }}
                onDelete={() => { handleSelectOption(defaultOption); }}
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
                currentLanguage={currentLanguage}
                currentUser={props.currentUser}
                enabledIntegrations={props.enabledIntegrations}
                hasUnsavedChanges={hasUnsavedChanges}
                key={currentLanguage}
                languages={languages.filter(f => f !== currentLanguage)}
                resources={resources}
                value={value.smooch_workflows[currentWorkflowIndex]}
                onChange={handleChangeMenu}
              /> : null }
            { currentOption === 'smooch_settings' ?
              <SmoochBotSettings
                currentUser={props.currentUser}
                enabledIntegrations={props.enabledIntegrations}
                installationId={props.installationId}
                schema={settingsSchema}
                settings={settings}
                onChange={handleUpdateSetting}
              /> : null }
          </div>
        </div>
      </React.Fragment>
    </React.Fragment>
  );
};

SmoochBotConfig.defaultProps = {
  resources: [],
};

SmoochBotConfig.propTypes = {
  currentUser: PropTypes.object.isRequired,
  enabledIntegrations: PropTypes.object.isRequired,
  hasUnsavedChanges: PropTypes.bool.isRequired,
  installationId: PropTypes.string.isRequired,
  resources: PropTypes.arrayOf(PropTypes.object),
  schema: PropTypes.object.isRequired,
  userRole: PropTypes.string.isRequired,
  value: PropTypes.object.isRequired, // saved settings for the Smooch Bot
  onChange: PropTypes.func.isRequired, // called after "save" is clicked
  onEditingResource: PropTypes.func.isRequired,
};

export default SmoochBotConfig;
