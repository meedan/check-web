import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import HelpIcon from '@material-ui/icons/HelpOutline';
import { languageLabel } from '../../../LanguageRegistry';
import SmoochBotMainMenuSection from './SmoochBotMainMenuSection';
import WarningAlert from '../../cds/alerts-and-prompts/WarningAlert';
import { checkBlue } from '../../../styles/js/shared';

const messages = defineMessages({
  privacyStatement: {
    id: 'smoochBotMainMenu.privacyStatement',
    defaultMessage: 'Privacy statement',
    description: 'Menu label used in the tipline bot',
  },
  languages: {
    id: 'smoochBotMainMenu.languages',
    defaultMessage: 'Languages',
    description: 'Menu label used in the tipline bot when multiple languages are collapsed in a single menu option',
  },
  numberOfLanguages: {
    id: 'smoochBotMainMenu.numberOfLanguages',
    defaultMessage: '{numberOfLanguages} languages',
    description: 'Menu description used in the tipline bot when multiple languages are collapsed in a single menu option (always plural)',
  },
});

const SmoochBotMainMenu = ({
  value,
  languages,
  enabledIntegrations,
  intl,
  onChange,
}) => {
  const resources = value.smooch_custom_resources || [];

  let optionsCount = 1; // "Privacy Policy" option
  let collapsedCount = 2; // "Privacy Policy" and "Languages" options
  if (languages.length >= 1) {
    optionsCount += languages.length;
  }
  if (value?.smooch_state_main?.smooch_menu_options) {
    optionsCount += value.smooch_state_main.smooch_menu_options.length;
    collapsedCount += value.smooch_state_main.smooch_menu_options.length;
  }
  if (value?.smooch_state_secondary?.smooch_menu_options) {
    optionsCount += value.smooch_state_secondary.smooch_menu_options.length;
    collapsedCount += value.smooch_state_secondary.smooch_menu_options.length;
  }

  let languageOptions = languages.map(l => ({ smooch_menu_option_label: languageLabel(l) }));
  const collapseLanguages = (optionsCount > 10 && languages.length >= 1);
  if (collapseLanguages) {
    languageOptions = [{
      smooch_menu_option_label: `🌐 ${intl.formatMessage(messages.languages)}`,
      smooch_menu_option_description: intl.formatMessage(messages.numberOfLanguages, { numberOfLanguages: languages.length + 1 }),
    }];
  }

  const canCreateNewOption = (collapsedCount < 10 || optionsCount < 10);

  const handleChangeTitle = (newValue, menu) => {
    onChange({ smooch_menu_title: newValue }, menu);
  };

  const handleChangeMenuOptions = (newOptions, menu) => {
    onChange({ smooch_menu_options: newOptions }, menu);
  };

  const whatsAppEnabled = (enabledIntegrations.whatsapp && enabledIntegrations.whatsapp.status === 'active');

  return (
    <React.Fragment>
      <Typography variant="subtitle2" component="div">
        <FormattedMessage id="smoochBotMainMenu.mainMenu" defaultMessage="Main menu" description="Title of the tipline bot main menu settings page." />
      </Typography>

      { Object.keys(enabledIntegrations).filter(platformName => platformName !== 'whatsapp').length > 0 ? // Any platform other than WhatsApp
        <Box display="flex" alignItems="center" mb={1}>
          <Typography component="div" variant="body2">
            <FormattedMessage
              id="smoochBotMainMenu.subtitle2"
              defaultMessage="Please note that some messaging services have different menu display options than others."
              description="Subtitle displayed in tipline settings page for the main menu if the tipline is enabled for WhatsApp and at least one more platform."
            />
          </Typography>
          <a href="https://help.checkmedia.org/en/articles/5982401-tipline-bot-settings" target="_blank" rel="noopener noreferrer">
            <HelpIcon style={{ color: checkBlue }} />
          </a>
        </Box> : null }
      <Typography component="div" variant="subtitle2" paragraph>
        <FormattedMessage
          id="smoochBotMainMenu.optionsCounter"
          defaultMessage="{available}/{total} main menu options available"
          description="Counter that is displayed on tipline settings page in order to inform the user how many options they can still add to the bot main menu."
          values={{
            available: 10 - collapsedCount,
            total: 10,
          }}
        />
      </Typography>

      { collapseLanguages ?
        <WarningAlert
          title={
            <FormattedMessage
              id="smoochBotMainMenu.alertTitle"
              defaultMessage="There are {numberOfOptions} including all languages. Detailed language options will be sent to users when they select the option '🌐 Languages'."
              values={{ numberOfOptions: optionsCount }}
              description="Title of an alert box displayed on tipline main menu settings page when there are more than 10 options."
            />
          }
        /> : null }

      <SmoochBotMainMenuSection
        number={1}
        value={value.smooch_state_main}
        resources={resources}
        noTitleNoDescription={!whatsAppEnabled}
        canCreate={canCreateNewOption}
        onChangeTitle={(newValue) => { handleChangeTitle(newValue, 'smooch_state_main'); }}
        onChangeMenuOptions={(newOptions) => { handleChangeMenuOptions(newOptions, 'smooch_state_main'); }}
      />

      { whatsAppEnabled ?
        <SmoochBotMainMenuSection
          number={2}
          value={value.smooch_state_secondary}
          resources={resources}
          canCreate={canCreateNewOption}
          onChangeTitle={(newValue) => { handleChangeTitle(newValue, 'smooch_state_secondary'); }}
          onChangeMenuOptions={(newOptions) => { handleChangeMenuOptions(newOptions, 'smooch_state_secondary'); }}
          optional
        /> : null }

      <SmoochBotMainMenuSection
        number={3}
        value={
          languages.length >= 1 ?
            {
              smooch_menu_title: <FormattedMessage id="smoochBotMainMenu.languagesAndPrivacy" defaultMessage="Languages and Privacy" description="Title of the main menu third section of the tipline where there is more than one supported language" />,
              smooch_menu_options: languageOptions.concat({ smooch_menu_option_label: intl.formatMessage(messages.privacyStatement) }),
            } :
            {
              smooch_menu_title: <FormattedMessage id="smoochBotMainMenu.privacy" defaultMessage="Privacy" description="Title of the main menu third section of the tipline when there is only one supported language" />,
              smooch_menu_options: [{ smooch_menu_option_label: intl.formatMessage(messages.privacyStatement) }],
            }
        }
        onChangeTitle={() => {}}
        onChangeMenuOptions={() => {}}
        readOnly
      />
    </React.Fragment>
  );
};

SmoochBotMainMenu.defaultProps = {
  value: {},
  languages: [],
};

SmoochBotMainMenu.propTypes = {
  value: PropTypes.object,
  languages: PropTypes.arrayOf(PropTypes.string),
  intl: intlShape.isRequired,
  enabledIntegrations: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default injectIntl(SmoochBotMainMenu);
