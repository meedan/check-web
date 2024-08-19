/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import SmoochBotMainMenuSection from './SmoochBotMainMenuSection';
import HelpIcon from '../../../icons/help.svg';
import { languageLabel } from '../../../LanguageRegistry';
import Alert from '../../cds/alerts-and-prompts/Alert';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import styles from '../Settings.module.css';

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
  currentLanguage,
  currentUser,
  enabledIntegrations,
  hasUnsavedChanges,
  intl,
  languages,
  onChange,
  resources,
  value,
}) => {
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

  const handleHelp = () => {
    window.open('https://help.checkmedia.org/en/articles/8772777-setup-your-tipline-bot');
  };

  return (
    <React.Fragment>
      <div className={styles['setting-content-container-title']}>
        <FormattedMessage defaultMessage="Main menu" description="Title of the tipline bot main menu settings page." id="smoochBotMainMenu.mainMenu" />
        { Object.keys(enabledIntegrations).filter(platformName => platformName !== 'whatsapp').length > 0 ? // Any platform other than WhatsApp
          <div className={styles['setting-content-container-actions']}>
            <ButtonMain
              iconCenter={<HelpIcon />}
              size="small"
              theme="text"
              variant="text"
              onClick={handleHelp}
            />
          </div>
          : null
        }
      </div>
      { Object.keys(enabledIntegrations).filter(platformName => platformName !== 'whatsapp').length > 0 ? // Any platform other than WhatsApp
        <FormattedMessage
          defaultMessage="Please note that some messaging services have different menu display options than others."
          description="Subtitle displayed in tipline settings page for the main menu if the tipline is enabled for WhatsApp and at least one more platform."
          id="smoochBotMainMenu.subtitle2"
          tagName="p"
        />
        : null
      }
      <div className="typography-subtitle2">
        <FormattedMessage
          defaultMessage="{available}/{total} main menu options available"
          description="Counter that is displayed on tipline settings page in order to inform the user how many options they can still add to the bot main menu."
          id="smoochBotMainMenu.optionsCounter"
          values={{
            available: 10 - collapsedCount,
            total: 10,
          }}
        />
      </div>
      <br />
      { collapseLanguages ?
        <Alert
          content={
            <FormattedMessage
              defaultMessage="There are {numberOfOptions} options including all languages on this workspace. Only {numberOfLanguages} languages will be sent to users when they select the 'Languages' option."
              description="Title of an alert box displayed on tipline main menu settings page when there are more than 10 options."
              id="smoochBotMainMenu.alertTitle"
              values={{ numberOfOptions: optionsCount, numberOfLanguages: (languages.length + 1) }}
            />
          }
          variant="warning"
        /> : null }

      <SmoochBotMainMenuSection
        canCreate={canCreateNewOption}
        currentLanguage={currentLanguage}
        currentUser={currentUser}
        hasUnsavedChanges={hasUnsavedChanges}
        noTitleNoDescription={!whatsAppEnabled}
        number={1}
        resources={resources}
        value={value.smooch_state_main}
        onChangeMenuOptions={(newOptions) => { handleChangeMenuOptions(newOptions, 'smooch_state_main'); }}
        onChangeTitle={(newValue) => { handleChangeTitle(newValue, 'smooch_state_main'); }}
      />

      { whatsAppEnabled ?
        <SmoochBotMainMenuSection
          canCreate={canCreateNewOption}
          currentLanguage={currentLanguage}
          currentUser={currentUser}
          hasUnsavedChanges={hasUnsavedChanges}
          number={2}
          optional
          resources={resources}
          value={value.smooch_state_secondary}
          onChangeMenuOptions={(newOptions) => { handleChangeMenuOptions(newOptions, 'smooch_state_secondary'); }}
          onChangeTitle={(newValue) => { handleChangeTitle(newValue, 'smooch_state_secondary'); }}
        /> : null }

      <SmoochBotMainMenuSection
        number={3}
        readOnly
        value={
          languages.length >= 1 ?
            {
              smooch_menu_title: <FormattedMessage defaultMessage="Languages and Privacy" description="Title of the main menu third section of the tipline where there is more than one supported language" id="smoochBotMainMenu.languagesAndPrivacy" />,
              smooch_menu_options: languageOptions.concat({ smooch_menu_option_label: intl.formatMessage(messages.privacyStatement) }),
            } :
            {
              smooch_menu_title: <FormattedMessage defaultMessage="Privacy" description="Title of the main menu third section of the tipline when there is only one supported language" id="smoochBotMainMenu.privacy" />,
              smooch_menu_options: [{ smooch_menu_option_label: intl.formatMessage(messages.privacyStatement) }],
            }
        }
        onChangeMenuOptions={() => {}}
        onChangeTitle={() => {}}
      />
    </React.Fragment>
  );
};

SmoochBotMainMenu.defaultProps = {
  value: {},
  languages: [],
  resources: [],
};

SmoochBotMainMenu.propTypes = {
  value: PropTypes.object,
  languages: PropTypes.arrayOf(PropTypes.string),
  currentLanguage: PropTypes.string.isRequired,
  intl: intlShape.isRequired,
  enabledIntegrations: PropTypes.object.isRequired,
  currentUser: PropTypes.shape({ is_admin: PropTypes.bool.isRequired }).isRequired,
  hasUnsavedChanges: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  resources: PropTypes.arrayOf(PropTypes.object),
};

export default injectIntl(SmoochBotMainMenu);
