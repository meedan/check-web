import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import LimitedTextArea from './LimitedTextArea';

describe('<LimitedTextArea />', () => {
  it('should render LimitedTextArea when value is null ', () => {
    const wrapper = mountWithIntl(<LimitedTextArea
      maxChars={100}
      value={null}
    />);
    expect(wrapper.html()).toMatch('100 characters left');
  });
});
