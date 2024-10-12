import React from 'react';
import { shallow } from 'enzyme';
import ArticleCard from './ArticleCard';

describe('<ArticleCard />', () => {
  it('should render ArticleCard component', () => {
    const wrapper = shallow(<ArticleCard
      date={1687921388}
      handleClick={() => {}}
      statusLabel="Test"
      title="Test"
    />);
    expect(wrapper.find('.article-card')).toHaveLength(1);
  });
});
