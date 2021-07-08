import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
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

  const installation = team.smooch_bot
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
    setSaving(true);

    const mutation = graphql`
      mutation SmoochBotComponentUpdateTeamBotInstallationMutation($input: UpdateTeamBotInstallationInput!) {
        updateTeamBotInstallation(input: $input) {
          team_bot_installation {
            id
            json_settings
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          id: installation.id,
          json_settings: JSON.stringify(settings),
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess();
        }
      },
      onError: () => {
        handleError();
      },
    });
  };

  const handleInstall = () => {
    setSaving(true);

    const mutation = graphql`
      mutation SmoochBotComponentCreateTeamBotInstallationMutation($input: CreateTeamBotInstallationInput!) {
        createTeamBotInstallation(input: $input) {
          team {
            slug
          }
        }
      }
    `;

    commitMutation(Store, {
      mutation,
      variables: {
        input: {
          user_id: smoochBotDbid,
          team_id: team.dbid,
        },
      },
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess();
          window.location.assign(`/${response.createTeamBotInstallation.team.slug}/settings/tipline`);
        }
      },
      onError: () => {
        handleError();
      },
    });
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
      { installation && bot && languages.length > 1 ?
        <LanguageSwitcher
          orientation="vertical"
          primaryLanguage={defaultLanguage}
          currentLanguage={currentLanguage}
          languages={languages}
          onChange={handleChangeLanguage}
        /> : null }
      <ContentColumn large>
        <SettingsHeader
          title={
            <FormattedMessage
              id="smoochBotComponent.title"
              defaultMessage="Tipline"
            />
          }
          subtitle={
            <FormattedMessage
              id="smoochBotComponent.subtitle"
              defaultMessage="Create automated conversational bots to receive content from your audience."
            />
          }
          helpUrl="https://help.checkmedia.org/en/articles/4838307-creating-your-tipline-bot"
          actionButton={
            installation ?
              <Can permissions={team.permissions} permission="update Team">
                <Button color="primary" variant="contained" id="smooch-bot-component__save" onClick={handleSave} disabled={saving}>
                  <FormattedMessage id="smoochBotComponent.save" defaultMessage="Save settings" />
                </Button>
              </Can> : null
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
