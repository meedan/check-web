import React from 'react';
import { MediaSuggestionsComponentTest } from './MediaSuggestionsComponent';
import { shallow } from 'enzyme';

describe('<MediaSuggestionsComponent />', () => {
  const team = {
    dbid: 123,
    name: 'new-team',
    slug: 'new-team',
    permissions: JSON.stringify({}),
    smooch_bot: {id: 'id'},
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
    id: "UHJvamVjdE1lZGlhLzgw\n",
    report_type: "claim",
    suggested_similar_relationships: { edges:[]}
  }

  const empty_relationships = []

  const relationships = [
    {id: "1", target_id: 1, target: {created_at: '', last_seen:''}},
    {id: "2", target_id: 2, target: {created_at: '', last_seen:''}},
  ]

  it('should not render suggested media action buttons if media has no suggested media', () => {
    const wrapper = shallow(<MediaSuggestionsComponentTest
      team={team}
      media={media}
      relationships={empty_relationships}
      mainItem={mainItem}
      setFlashMessage={() =>{}}
    />);
    expect(wrapper.find('#similarity-media-item__accept-relationship')).toHaveLength(0);
    expect(wrapper.find('#similarity-media-item__reject-relationship')).toHaveLength(0);
    expect(wrapper.find('[data-testid="media-suggestions__no-suggestions-mensage"]')).toHaveLength(1);
  });

  it('should render suggested media action buttons if media has suggested medias', () => {
    const wrapper = shallow(<MediaSuggestionsComponentTest
      team={team}
      media={media}
      relationships={relationships}
      mainItem={mainItem}
      setFlashMessage={() =>{}}
    />);
    expect(wrapper.find('#similarity-media-item__accept-relationship')).toHaveLength(1);
    expect(wrapper.find('#similarity-media-item__reject-relationship')).toHaveLength(1);
  });
});
