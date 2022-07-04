import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import SearchField from './SearchField';

describe('<SearchResults />', () => {
  const node = <div />;

  it('should check that onBlur is called when press "enter" on input field', () => {
    const onBlur = jest.fn();
    const wrapper = mountWithIntl(<SearchField
      isActive
      inputBaseProps={{
        onBlur,
      }}
      endAdorment={node}
      showExpand
      setParentSearchText={() => {}}
    />);
    wrapper.find('#search-input').hostNodes().simulate('click');
    wrapper.find('#search-input').hostNodes().simulate('keypress', { key: 'Enter' });
    expect(onBlur).toHaveBeenCalled();
  });
});
