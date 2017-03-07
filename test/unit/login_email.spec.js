import React from 'react';
import { expect } from 'chai';
import { render } from 'enzyme';
import { IntlProvider } from 'react-intl';

import LoginEmail from '../../src/app/components/LoginEmail';

const intlProvider = new IntlProvider({ locale: 'en', messages: {} }, {});
const { intl } = intlProvider.getChildContext();

describe('<LoginEmail />', () => {
  it('should have collapsed form by default', function() {
    const wrapper = render(<IntlProvider locale="en"><LoginEmail intl={intl} /></IntlProvider>);
    expect(wrapper.find('.login-email__modal--open')).to.have.length(0);
  });
});
