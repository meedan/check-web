import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import UserUtil from '../../user/UserUtil';
import SettingsHeader from '../SettingsHeader';
import LanguageSwitcher from '../../LanguageSwitcher';
import SmoochBotConfig from './SmoochBotConfig';
import { placeholders } from './localizables';
import Can from '../../Can';
import { ContentColumn } from '../../../styles/js/shared';
import { withSetFlashMessage } from '../../FlashMessage';
import GenericUnknownErrorMessage from '../../GenericUnknownErrorMessage';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import CreateTeamBotInstallationMutation from '../../../relay/mutations/CreateTeamBotInstallationMutation';
import UpdateTeamBotInstallationMutation from '../../../relay/mutations/UpdateTeamBotInstallationMutation';

const SmoochBotComponent = ({
  team,
  currentUser,
  smoochBotDbid,
  intl,
  setFlashMessage,
}) => {
  const [saving, setSaving] = React.useState(false);
  const defaultLanguage = team.get_language || 'en';
  const [currentLanguage, setCurrentLanguage] = React.useState(defaultLanguage);
  const languages = team.get_languages ? JSON.parse(team.get_languages) : [defaultLanguage];
  const [showContentError, setShowContentError] = React.useState(false);

  const installation = team.smooch_bot;
  const bot = installation ? installation.team_bot : null;

  const [settings, setSettings] = React.useState(installation ? JSON.parse(installation.json_settings) : {});

  const userRole = UserUtil.myRole(currentUser, team.slug);

  const handleOpenForm = () => {
    window.open('https://airtable.com/shr727e2MeBQnTGa1');
  };

  const handleError = () => {
    setSaving(false);
    setFlashMessage((<GenericUnknownErrorMessage />), 'error');
  };

  const handleSuccess = () => {
    setSaving(false);
    setFlashMessage((
      <FormattedMessage
        id="smoochBotComponent.savedSuccessfully"
        defaultMessage="Tipline settings saved successfully"
        description="Banner displayed when tipline settings are saved successfully"
      />
    ), 'success');
  };

  const handleSave = () => {
    if (settings.smooch_version === 'v2' && settings.smooch_workflows.find(w => w.newsletter_optin_optout && !/{subscription_status}/.test(w.newsletter_optin_optout))) {
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
    // If there is no workflow for this language, create a new, empty one
    if (settings.smooch_workflows.filter(w => w.smooch_workflow_language === newValue).length === 0) {
      const updatedValue = JSON.parse(JSON.stringify(settings));
      updatedValue.smooch_workflows.push({
        smooch_workflow_language: newValue,
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
      setSettings(updatedValue);
    }
    setCurrentLanguage(newValue);
  };
  // If only on language, no margin left. If more than one language the language selector is displayed, so we add a margin.
  return (
    <Box display="flex" justifyContent="left" className="smooch-bot-component" ml={installation && bot && languages.length > 1 ? 0 : 6}>
      <ContentColumn large>
        <SettingsHeader
          title={
            <FormattedMessage
              id="smoochBotComponent.title"
              defaultMessage="Tipline"
            />
          }
          helpUrl="https://help.checkmedia.org/en/articles/4838307-creating-your-tipline-bot"
          actionButton={
            installation ?
              <Can permissions={team.permissions} permission="update Team">
                <Button color="primary" variant="contained" id="smooch-bot-component__save" onClick={handleSave} disabled={saving}>
                  <FormattedMessage id="smoochBotComponent.save" defaultMessage="Publish" />
                </Button>
              </Can> : null
          }
          extra={
            installation && bot && languages.length > 1 ?
              <LanguageSwitcher
                component="dropdown"
                currentLanguage={currentLanguage}
                languages={languages}
                onChange={handleChangeLanguage}
              /> : null
          }
        />
        <Card>
          <CardContent>
            { installation && bot ?
              <SmoochBotConfig
                bot={bot}
                installationId={installation.id}
                schema={JSON.parse(bot.settings_as_json_schema)}
                uiSchema={JSON.parse(bot.settings_ui_schema)}
                value={settings}
                onChange={setSettings}
                currentUser={currentUser}
                userRole={userRole}
                currentLanguage={currentLanguage}
                languages={languages}
                enabledIntegrations={installation.smooch_enabled_integrations}
                newsletterInformation={installation.smooch_newsletter_information}
              /> :
              <Box display="flex" alignItems="center" justifyContent="center" mt={30} mb={30}>
                { currentUser.is_admin ?
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleInstall}
                    disable={saving}
                  >
                    <FormattedMessage
                      data-testid="install-smooch__button"
                      id="smoochBotComponent.install"
                      defaultMessage="Install"
                    />
                  </Button> :
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenForm}
                  >
                    <FormattedMessage
                      id="smoochBotComponent.contactUs"
                      defaultMessage="Contact us to setup"
                    />
                  </Button> }
              </Box>
            }
          </CardContent>
        </Card>
      </ContentColumn>
      <ConfirmProceedDialog
        open={showContentError}
        title={
          <FormattedMessage
            id="smoochBotComponent.missingInformationTitle"
            defaultMessage="Missing information"
            description="Title of dialog that opens when there is a validation error on tipline settings"
          />
        }
        body={(
          <FormattedMessage
            id="smoochBotComponent.missingInformationBody"
            defaultMessage="The step '11. Newsletter opt-in and opt-out' is missing a placeholder."
            description="Content of dialog that opens when there is a validation error on tipline settings"
          />
        )}
        proceedLabel={<FormattedMessage id="smoochBotComponent.back" defaultMessage="Go back to editing" description="Button label to close error dialog on tipline settings page" />}
        onProceed={() => { setShowContentError(false); }}
        onCancel={null}
      />
    </Box>
  );
};

SmoochBotComponent.propTypes = {
  currentUser: PropTypes.object.isRequired, // FIXME: List the fields needed
  team: PropTypes.object.isRequired, // FIXME: List the fields needed
  smoochBotDbid: PropTypes.number.isRequired,
  intl: intlShape.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
};

export default injectIntl(withSetFlashMessage(SmoochBotComponent));
