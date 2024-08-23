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

  // FIXME: Extract RelationshipItem subcomponent to its own file and move teste accordingly
  // const relationships = [
  //   { id: '1', target_id: 1, target: { created_at: '', last_seen: '', type: 'Link' } },
  //   { id: '2', target_id: 2, target: { created_at: '', last_seen: '', type: 'Claim' } },
  //   { id: '3', target_id: 3, target: { created_at: '', last_seen: '', type: 'Link' } },
  // ];

  // FIXME: Extract RelationshipItem subcomponent to its own file and move teste accordingly
  // it('should render suggested media action items if media has suggested medias', () => {
  //   const wrapper = shallow(<MediaSuggestionsComponentTest
  //     team={team}
  //     media={media}
  //     relationships={relationships}
  //     mainItem={mainItem}
  //     setFlashMessage={() => {}}
  //     intl={intl}
  //     reportType="blank"
  //     pageSize={Infinity}
  //     totalCount={5}
  //     project={{}}
  //     relay={{}}
  //   />);
  //   expect(wrapper.find('.similarity-media-item__accept-relationship')).toHaveLength(3);
  //   expect(wrapper.find('.similarity-media-item__reject-relationship')).toHaveLength(3);
  //   expect(wrapper.find('.similarity-media-no-items')).toHaveLength(0);
  // });

  // FIXME: Extract RelationshipItem subcomponent to its own file and move teste accordingly
  // it('should render paginated suggested media action items if media has suggested medias and a pageSize', () => {
  //   const wrapper = shallow(<MediaSuggestionsComponentTest
  //     team={team}
  //     media={media}
  //     relationships={relationships}
  //     mainItem={mainItem}
  //     setFlashMessage={() => {}}
  //     intl={intl}
  //     reportType="blank"
  //     pageSize={2}
  //     totalCount={5}
  //     project={{}}
  //     relay={{}}
  //   />);
  //   console.log('wrapper.debug()', wrapper.debug());
  //   expect(wrapper.find('.similarity-media-item__accept-relationship')).toHaveLength(2);
  //   expect(wrapper.find('.similarity-media-item__reject-relationship')).toHaveLength(2);
  //   expect(wrapper.find('.similarity-media-no-items')).toHaveLength(0);
  // });

  it('should render no media when no media is suggested', () => {
    const wrapper = shallow(<MediaSuggestionsComponentTest
      intl={intl}
      mainItem={mainItem}
      media={media}
      pageSize={2}
      project={{}}
      relationships={[]}
      relay={{}}
      reportType="blank"
      setFlashMessage={() => {}}
      team={team}
      totalCount={0}
    />);
    expect(wrapper.find('.similarity-media-item__accept-relationship')).toHaveLength(0);
    expect(wrapper.find('.similarity-media-item__reject-relationship')).toHaveLength(0);
    expect(wrapper.find('.similarity-media-no-items')).toHaveLength(1);
  });
});
