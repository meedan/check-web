import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import SuggestedMatches from './SuggestedMatches';

describe('<SuggestedMatches />', () => {
  const team = 'new-team';

  it('should sort Submitted descending by default', () => {
    const wrapper = mountWithIntl(<SuggestedMatches
      routeParams={{ team }}
    />);

    const renderedMockSearch = wrapper.find('ReactRelayQueryRenderer').props().render(
      {
        error: false,
        props: {
          team,
        },
      },
    );

    expect(renderedMockSearch.props.query.sort).toBe('recent_added');
  });
});
