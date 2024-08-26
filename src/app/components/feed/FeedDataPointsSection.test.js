import React from 'react';
import FeedDataPointsSection from './FeedDataPointsSection';
import { mountWithIntl, shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

const props = {
  title: <h1>Published fact-checks</h1>,
  content: <div>Includes all fact-check data.</div>,
};

describe('<FeedDataPointsSection />', () => {
  it('should render title and content', () => {
    const wrapper = mountWithIntl(<FeedDataPointsSection {...props} />);
    expect(wrapper.html()).toMatch('Published fact-checks');
    expect(wrapper.html()).toMatch('Includes all fact-check data');
  });

  it('should set switch state based on enabled value', () => {
    let wrapper = shallowWithIntl(<FeedDataPointsSection {...props} enabled />);
    expect(wrapper.find('SwitchComponent').prop('checked')).toBe(true);

    wrapper = shallowWithIntl(<FeedDataPointsSection {...props} enabled={false} />);
    expect(wrapper.find('SwitchComponent').prop('checked')).toBe(false);
  });

  it('should disable switch if read-only', () => {
    let wrapper = shallowWithIntl(<FeedDataPointsSection {...props} readOnly />);
    expect(wrapper.find('SwitchComponent').prop('disabled')).toBe(true);

    wrapper = shallowWithIntl(<FeedDataPointsSection {...props} readOnly={false} />);
    expect(wrapper.find('SwitchComponent').prop('disabled')).toBe(false);
  });
});
