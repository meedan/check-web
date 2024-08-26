import React from 'react';
import SuggestedMatches from './SuggestedMatches';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<SuggestedMatches />', () => {
  const team = 'new-team';

  it('should sort Submitted descending by default', () => {
    const wrapper = mountWithIntl(<SuggestedMatches
      routeParams={{ team }}
    />);

    expect(wrapper.find('Search').props().query.sort).toBe('recent_added');
  });
});
