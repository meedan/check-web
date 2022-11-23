import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import SmoochBotMainMenu from './SmoochBotMainMenu';
import WarningAlert from '../../cds/alerts-and-prompts/WarningAlert';

const defaultProps = {
  enabledIntegrations: {},
  onChange: () => {},
  languages: ['es', 'en'],
  value: {
    smooch_state_main: {
      smooch_menu_options: [{
        smooch_menu_option_label: 'Foo',
        smooch_menu_option_description: 'Foo',
      }],
    },
    smooch_state_secondary: {
      smooch_menu_options: [{
        smooch_menu_option_label: 'Bar',
        smooch_menu_option_description: 'Bar',
      }],
    },
  },
};

describe('<SmoochBotMainMenu />', () => {
  it('should render counter', () => {
    const wrapper = mountWithIntl(<SmoochBotMainMenu
      {...defaultProps}
    />);
    // Foo + Bar + Languages + Privacy
    expect(wrapper.text()).toContain('6/10 main menu options available');
  });

  it('should render warning', () => {
    const wrapper = mountWithIntl(<SmoochBotMainMenu
      {...defaultProps}
      languages={['en', 'es', 'fr', 'ar', 'pt', 'de', 'it', 'bn', 'hi']}
    />);
    expect(wrapper.find(WarningAlert)).toHaveLength(1);
  });

  it('should not render warning', () => {
    const wrapper = mountWithIntl(<SmoochBotMainMenu
      {...defaultProps}
    />);
    expect(wrapper.find(WarningAlert)).toHaveLength(0);
  });
});
