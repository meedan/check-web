import React from 'react';
import { render } from 'enzyme';
import { IntlProvider } from 'react-intl';

import Login from '../../src/app/components/Login';

const intlProvider = new IntlProvider({ locale: 'en', messages: {} }, {});

describe('<Login />', () => {
  it('should not have password confirmation in default login mode', function() {
    const wrapper = render(<IntlProvider locale="en"><Login /></IntlProvider>);
    expect(wrapper.find('.login__password-confirmation-input')).toHaveLength(0);
  });
});
