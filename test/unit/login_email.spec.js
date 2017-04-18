import React from 'react';
import { expect } from 'chai';
import { render } from 'enzyme';
import { IntlProvider } from 'react-intl';

import Login from '../../src/app/components/Login';

const intlProvider = new IntlProvider({ locale: 'en', messages: {} }, {});
const { intl } = intlProvider.getChildContext();

describe('<Login />', () => {
  it('should have collapsed form by default', function() {
    const wrapper = render(<IntlProvider locale="en"><Login intl={intl} /></IntlProvider>);
    expect(wrapper.find('.login-email__modal--open')).to.have.length(0);
  });
});
