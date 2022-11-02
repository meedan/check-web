import React from 'react';
import { shallow } from 'enzyme';
import { MediaSuggestionsComponentTest } from './MediaSuggestionsComponent';

describe('<MediaSuggestionsComponent />', () => {
  const team = {
    dbid: 123,
    name: 'new-team',
    slug: 'new-team',
    permissions: JSON.stringify({}),
    smooch_bot: { id: 'id' },
  };

  const media = {
    permissions: JSON.stringify({}),
    url: null,
    quote: 'test',
    title: 'test',
  };

  const mainItem = {
    dbid: 80,
    demand: 0,
    id: 'UHJvamVjdE1lZGlhLzgw\n',
    report_type: 'claim',
    suggested_similar_relationships: { edges: [] },
  };

  const intl = {
    formatDate: () => {},
  };

  const empty_relationships = [];

  const relationships = [
    { id: '1', target_id: 1, target: { created_at: '', last_seen: '', type: 'Link' } },
    { id: '2', target_id: 2, target: { created_at: '', last_seen: '', type: 'Claim' } },
  ];

  it('should not render suggested media action buttons if media has no suggested media', () => {
    const wrapper = shallow(<MediaSuggestionsComponentTest
      team={team}
      media={media}
      relationships={empty_relationships}
      mainItem={mainItem}
      setFlashMessage={() => {}}
      intl={intl}
      reportType="blank"
    />);
    expect(wrapper.find('.suggested-media__item')).toHaveLength(0);
  });

  it('should render suggested media action buttons if media has suggested medias', () => {
    const wrapper = shallow(<MediaSuggestionsComponentTest
      team={team}
      media={media}
      relationships={relationships}
      mainItem={mainItem}
      setFlashMessage={() => {}}
      intl={intl}
      reportType="blank"
    />);
    expect(wrapper.find('.similarity-media-item__accept-relationship')).toHaveLength(2);
    expect(wrapper.find('.similarity-media-item__reject-relationship')).toHaveLength(2);
  });
});
