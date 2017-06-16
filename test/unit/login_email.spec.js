import React from 'react';
import { expect } from 'chai';
import { render } from 'enzyme';
import { IntlProvider } from 'react-intl';

import Login from '../../src/app/components/Login';

const intlProvider = new IntlProvider({ locale: 'en', messages: {} }, {});
const { intl } = intlProvider.getChildContext();

describe('<Login />', () => {
  it('should not have password confirmation in default login mode', function() {
    const wrapper = render(<IntlProvider locale="en"><Login intl={intl} /></IntlProvider>);
    expect(wrapper.find('.login__password-confirmation-input')).to.have.length(0);
  });
});
