import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import { languageLabel } from '../../../LanguageRegistry';
import SmoochBotMainMenuSection from './SmoochBotMainMenuSection';

const messages = defineMessages({
  privacyStatement: {
    id: 'smoochBotMainMenu.privacyStatement',
    defaultMessage: 'Privacy statement',
    description: 'Menu label used in the tipline bot',
  },
});

const SmoochBotMainMenu = ({
  value,
  languages,
  intl,
  onChange,
}) => {
  const resources = value.smooch_custom_resources || [];

  const handleChangeTitle = (newValue, menu) => {
    onChange({ smooch_menu_title: newValue }, menu);
  };

  const handleChangeMenuOptions = (newOptions, menu) => {
    onChange({ smooch_menu_options: newOptions }, menu);
  };

  return (
    <React.Fragment>
      <Typography variant="subtitle2" component="div">
        <FormattedMessage id="smoochBotMainMenu.mainMenu" defaultMessage="Main menu" description="Title of the tipline bot main menu settings page." />
      </Typography>

      <Typography component="div" variant="body2">
        <FormattedMessage
          id="smoochBotMainMenu.subtitle"
          defaultMessage="The menu of your bot, asking the user to choose between a set of options. The second section is optional. Please note that on WhatsApp you can have at maximum 10 menu options across all sections."
          description="Subtitle displayed in tipline settings page for the main menu."
        />
      </Typography>

      <SmoochBotMainMenuSection
        number={1}
        value={value.smooch_state_main}
        resources={resources}
        onChangeTitle={(newValue) => { handleChangeTitle(newValue, 'smooch_state_main'); }}
        onChangeMenuOptions={(newOptions) => { handleChangeMenuOptions(newOptions, 'smooch_state_main'); }}
      />

      <SmoochBotMainMenuSection
        number={2}
        value={value.smooch_state_secondary}
        resources={resources}
        onChangeTitle={(newValue) => { handleChangeTitle(newValue, 'smooch_state_secondary'); }}
        onChangeMenuOptions={(newOptions) => { handleChangeMenuOptions(newOptions, 'smooch_state_secondary'); }}
        optional
      />

      <SmoochBotMainMenuSection
        number={3}
        value={
          languages.length > 1 ?
            {
              smooch_menu_title: <FormattedMessage id="smoochBotMainMenu.languagesAndPrivacy" defaultMessage="Languages and Privacy" description="Title of the main menu third section of the tipline where there is more than one supported language" />,
              smooch_menu_options: languages.map(l => ({ smooch_menu_option_label: languageLabel(l) })).concat({ smooch_menu_option_label: intl.formatMessage(messages.privacyStatement) }),
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
  onChange: PropTypes.func.isRequired,
};

export default injectIntl(SmoochBotMainMenu);
