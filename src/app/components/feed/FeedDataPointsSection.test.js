import React from 'react';
import FeedDataPointsSection from './FeedDataPointsSection';
import { mountWithIntl, shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<FeedDataPointsSection />', () => {
  it('should render Medias title and content', () => {
    const wrapper = mountWithIntl(<FeedDataPointsSection
      listType='media'
      onChange={() => {}}
      onRemove={() => {}}
    />);
    expect(wrapper.html()).toMatch('Media Clusters and Requests');
    expect(wrapper.html()).toMatch('<strong>Media Cluster</strong> data to be shared:');
  });

  it('should render Articles title and content', () => {
    const wrapper = mountWithIntl(<FeedDataPointsSection
      listType='article'
      onChange={() => {}}
      onRemove={() => {}}
    />);
    expect(wrapper.html()).toMatch('Articles');
    expect(wrapper.html()).toMatch('<strong>Article</strong> data to be shared:');
  });

  it('should set switch state based on enabled value', () => {
    let wrapper = shallowWithIntl(<FeedDataPointsSection
      enabled
      listType='media'
      onChange={() => {}}
      onRemove={() => {}}
    />);
    expect(wrapper.find('SwitchComponent').prop('checked')).toBe(true);

    wrapper = shallowWithIntl(<FeedDataPointsSection
      enabled={false}
      listType='media'
      onChange={() => {}}
      onRemove={() => {}}
    />);
    expect(wrapper.find('SwitchComponent').prop('checked')).toBe(false);
  });

  it('should disable switch if read-only', () => {
    let wrapper = shallowWithIntl(<FeedDataPointsSection
      listType='media'
      onChange={() => {}}
      onRemove={() => {}}
      readOnly
    />);
    expect(wrapper.find('SwitchComponent').prop('disabled')).toBe(true);

    wrapper = shallowWithIntl(<FeedDataPointsSection
      listType='media'
      onChange={() => {}}
      onRemove={() => {}}
      readOnly={false}
    />);
    expect(wrapper.find('SwitchComponent').prop('disabled')).toBe(false);
  });
});
