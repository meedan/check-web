import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import cx from 'classnames/bind';
import SmoochBotConfig from './SmoochBotConfig';
import { placeholders } from './localizables';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import UserUtil from '../../user/UserUtil';
import SettingsHeader from '../SettingsHeader';
import LanguagePickerSelect from '../../cds/inputs/LanguagePickerSelect';
import Can from '../../Can';
import { withSetFlashMessage } from '../../FlashMessage';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import CreateTeamBotInstallationMutation from '../../../relay/mutations/CreateTeamBotInstallationMutation';
import UpdateTeamBotInstallationMutation from '../../../relay/mutations/UpdateTeamBotInstallationMutation';
import { getErrorObjectsForRelayModernProblem } from '../../../helpers';
import CheckError from '../../../CheckError';
import settingsStyles from '../Settings.module.css';

const SmoochBotComponent = ({
  currentUser,
  intl,
  setFlashMessage,
  smoochBotDbid,
  team,
}) => {
  const [saving, setSaving] = React.useState(false);
  const [editingResource, setEditingResource] = React.useState(false);
  const defaultLanguage = team.get_language || 'en';
  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage);
  const languages = team.get_languages ? JSON.parse(team.get_languages) : [defaultLanguage];
  const [showContentError, setShowContentError] = React.useState(false);

  const installation = team.smooch_bot;
  const bot = installation ? installation.team_bot : null;

  const [settings, setSettings] = React.useState(installation ? JSON.parse(installation.json_settings) : {});

  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  React.useEffect(() => {
    setHasUnsavedChanges(false);
  }, [installation?.lock_version]);

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    setHasUnsavedChanges(true);
  };

  const userRole = UserUtil.myRole(currentUser, team.slug);

  const handleEditingResource = (value) => {
    if (value !== editingResource) {
      setEditingResource(value);
    }
  };

  const handleOpenForm = () => {
    window.open('https://airtable.com/shr727e2MeBQnTGa1');
  };

  const handleError = (transaction) => {
    setSaving(false);
    const errors = getErrorObjectsForRelayModernProblem(transaction.getError());
    const message = errors && errors.length > 0 ? CheckError.getMessageFromCode(errors[0].code) : <GenericUnknownErrorMessage />;
    setFlashMessage(message, 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Tipline settings saved successfully"
        description="Banner displayed when tipline settings are saved successfully"
        id="smoochBotComponent.savedSuccessfully"
      />
    ), 'success');
  };

  const handleSave = () => {
    if (settings.smooch_workflows.find(w => w.newsletter_optin_optout && !/{subscription_status}/.test(w.newsletter_optin_optout))) {
      setShowContentError(true);
    } else {
      setSaving(true);

      const files = [];
      settings.smooch_workflows.forEach((workflow) => {
        files.push(workflow.smooch_greeting_image);
      });

      Relay.Store.commitUpdate(
        new UpdateTeamBotInstallationMutation({
          id: installation.id,
          json_settings: JSON.stringify(settings),
          lock_version: installation.lock_version,
          files,
        }),
        { onSuccess: handleSuccess, onFailure: handleError },
      );
    }
  };

  const handleInstall = () => {
    setSaving(true);

    const callbacks = {
      onSuccess: () => {
        handleSuccess();
        window.location.assign(`/${team.slug}/settings/tipline`);
      },
      onFailure: handleError,
    };
    Relay.Store.commitUpdate(new CreateTeamBotInstallationMutation({ bot: { dbid: smoochBotDbid }, team }), callbacks);
  };

  const handleChangeLanguage = (newValue) => {
    const { languageCode } = newValue;
    // If there is no workflow for this language, create a new, empty one
    if (settings.smooch_workflows.filter(w => w.smooch_workflow_language === languageCode).length === 0) {
      const updatedValue = JSON.parse(JSON.stringify(settings));
      updatedValue.smooch_workflows.push({
        smooch_workflow_language: languageCode,
        smooch_message_smooch_bot_result_changed:
          intl.formatMessage(placeholders.smooch_message_smooch_bot_result_changed),
        smooch_message_smooch_bot_message_confirmed:
          intl.formatMessage(placeholders.smooch_message_smooch_bot_message_confirmed),
        smooch_message_smooch_bot_message_type_unsupported:
          intl.formatMessage(placeholders.smooch_message_smooch_bot_message_type_unsupported),
        smooch_message_smooch_bot_disabled:
          intl.formatMessage(placeholders.smooch_message_smooch_bot_disabled),
        smooch_message_smooch_bot_greetings:
          intl.formatMessage(placeholders.smooch_message_smooch_bot_greetings),
        smooch_message_smooch_bot_option_not_available:
          intl.formatMessage(placeholders.smooch_message_smooch_bot_option_not_available),
        smooch_state_main: {
          smooch_menu_message: intl.formatMessage(placeholders.smooch_state_main),
          smooch_menu_options: [],
        },
        smooch_state_secondary: {
          smooch_menu_message: intl.formatMessage(placeholders.smooch_state_secondary),
          smooch_menu_options: [],
        },
        smooch_state_query: {
          smooch_menu_message: intl.formatMessage(placeholders.smooch_state_query),
          smooch_menu_options: [],
        },
      });
      updateSettings(updatedValue);
    }
    setCurrentLanguage(languageCode);
  };

  // Workspace languages for which there is a tipline workflow
  const workflowLanguages = settings?.smooch_workflows?.map(w => w.smooch_workflow_language) || [];
  const validLanguages = languages.filter(l => workflowLanguages.includes(l)) || [];

  // If only on language, no margin left. If more than one language the language selector is displayed, so we add a margin.
  return (
    <>
      <SettingsHeader
        actionButton={
          installation && !editingResource ?
            <Can permission="update Team" permissions={team.permissions}>
              <ButtonMain
                buttonProps={{
                  id: 'smooch-bot-component__save',
                }}
                disabled={saving}
                label={
                  <FormattedMessage
                    defaultMessage="Publish"
                    description="Button label to save and publish the tipline settings"
                    id="smoochBotComponent.save"
                  />
                }
                size="default"
                theme="info"
                variant="contained"
                onClick={handleSave}
              />
            </Can> : null
        }
        context={
          <FormattedHTMLMessage
            defaultMessage='Manage your tipline’s menu, customize its responses, and connect it to messaging services. <a href="{helpLink}" target="_blank" title="Learn more">Learn more</a>.'
            description="Context description for the functionality of this page"
            id="smoochBotComponent.helpContext"
            values={{ helpLink: 'https://help.checkmedia.org/en/articles/8772777-setup-your-tipline-bot' }}
          />
        }
        extra={
          installation && bot && languages.length > 1 ?
            <LanguagePickerSelect
              languages={languages}
              selectedLanguage={currentLanguage}
              onSubmit={handleChangeLanguage}
            /> : null
        }
        title={
          <FormattedMessage
            defaultMessage="Tipline"
            description="Page title for tipling settings page"
            id="smoochBotComponent.title"
          />
        }
      />
      <div className={cx(settingsStyles['setting-details-wrapper'])}>
        <div className={cx('smooch-bot-component', settingsStyles['setting-content-container'])}>
          { installation && bot ?
            <SmoochBotConfig
              bot={bot}
              currentLanguage={currentLanguage}
              currentUser={currentUser}
              enabledIntegrations={installation.smooch_enabled_integrations}
              hasUnsavedChanges={hasUnsavedChanges}
              installationId={installation.id}
              languages={validLanguages}
              resources={team.tipline_resources.edges.map(edge => edge.node).filter(node => node.language === currentLanguage)}
              schema={JSON.parse(bot.settings_as_json_schema)}
              uiSchema={JSON.parse(bot.settings_ui_schema)}
              userRole={userRole}
              value={settings}
              onChange={updateSettings}
              onEditingResource={handleEditingResource}
            /> :
            <div className={settingsStyles['install-bot-wrapper']}>
              { currentUser.is_admin ?
                <ButtonMain
                  disable={saving}
                  label={
                    <FormattedMessage
                      data-testid="install-smooch__button"
                      defaultMessage="Install"
                      description="Button label for action to install the tipline in this workspace"
                      id="smoochBotComponent.install"
                    />
                  }
                  size="default"
                  theme="info"
                  variant="contained"
                  onClick={handleInstall}
                /> :
                <ButtonMain
                  label={
                    <FormattedMessage
                      defaultMessage="Contact us to setup"
                      description="Button label for contacting support for help setting up a tipline in this workspace"
                      id="smoochBotComponent.contactUs"
                    />
                  }
                  size="default"
                  theme="info"
                  variant="contained"
                  onClick={handleOpenForm}
                /> }
            </div>
          }
          <ConfirmProceedDialog
            body={(
              <FormattedMessage
                defaultMessage="The message 'Newsletter opt-in and opt-out' is missing a placeholder."
                description="Content of dialog that opens when there is a validation error on tipline settings"
                id="smoochBotComponent.missingInformationBody"
              />
            )}
            open={showContentError}
            proceedLabel={<FormattedMessage defaultMessage="Go back to editing" description="Button label to close error dialog on tipline settings page" id="smoochBotComponent.back" />}
            title={
              <FormattedMessage
                defaultMessage="Missing information"
                description="Title of dialog that opens when there is a validation error on tipline settings"
                id="smoochBotComponent.missingInformationTitle"
              />
            }
            onCancel={null}
            onProceed={() => { setShowContentError(false); }}
          />
        </div>
      </div>
    </>
  );
};

SmoochBotComponent.propTypes = {
  currentUser: PropTypes.object.isRequired, // FIXME: List the fields needed
  intl: intlShape.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
  smoochBotDbid: PropTypes.number.isRequired,
  team: PropTypes.object.isRequired, // FIXME: List the fields needed
};

export default injectIntl(withSetFlashMessage(SmoochBotComponent));
