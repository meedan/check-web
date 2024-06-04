import React from 'react';
import ClusterCard from './ClusterCard';
import CheckFeedDataPoints from '../../../CheckFeedDataPoints';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';

describe('<ClusterCard />', () => {
  it('should always render a card', () => {
    const wrapper = mountWithIntl(
      <ClusterCard
        title="Title"
        date={new Date()}
      />,
    );
    expect(wrapper.find('.cluster-card').length).toBe(1);
  });

  it('should render the date', () => {
    const date = new Date();
    const wrapper = mountWithIntl(
      <ClusterCard
        title="Title"
        date={date}
      />);
    expect(wrapper.find('ItemDate').length).toBe(1);
  });

  it('should be selectable by checkbox if onCheckboxChange provided', () => {
    const wrapper = mountWithIntl(
      <ClusterCard
        title="Title"
        date={new Date()}
        onCheckboxChange={() => {}}
      />,
    );
    expect(wrapper.find('Checkbox').length).toBe(1);
  });

  it('should render a fact check count if feed contains fact checks', () => {
    const wrapper = mountWithIntl(
      <ClusterCard
        title="Title"
        date={new Date()}
        dataPoints={[CheckFeedDataPoints.PUBLISHED_FACT_CHECKS]}
        factCheckCount={3}
      />,
    );
    expect(wrapper.find('ButtonMain').html()).toContain('3 Fact-checks');
  });

  it('should render the item rating', () => {
    const wrapper = mountWithIntl(
      <ClusterCard
        title="Title"
        date={new Date()}
        rating="Verdadeiro"
        isPublished
      />,
    );
    expect(wrapper.find('ItemRating').html()).toContain('Verdadeiro');
  });
});
