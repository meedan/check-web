import React from 'react';
import SearchField from './SearchField';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<SearchResults />', () => {
  it('should check that onBlur is called when press "enter" on input field', () => {
    const onBlur = jest.fn();
    const wrapper = mountWithIntl(<SearchField
      inputBaseProps={{
        onBlur,
      }}
      isActive
      setParentSearchText={() => {}}
      showExpand
    />);
    wrapper.find('#search-input').hostNodes().simulate('click');
    wrapper.find('#search-input').hostNodes().simulate('keypress', { key: 'Enter' });
    expect(onBlur).toHaveBeenCalled();
  });
});
