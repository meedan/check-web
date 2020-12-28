import React from 'react';
import { mount} from 'enzyme';
import SpecialBlueCard from './SpecialBlueCard';

describe('<SpecialBlueCard />', function() {
  it('should render title and content', function() {
    const title = 'Card title' 
    const content = 'Card content'
    const wrapper = mount(<SpecialBlueCard title = {title} content = {content}/>);
    expect(wrapper.find('.SpecialBlueCard__StyledMdCardTitle-tbogxs-3').hostNodes()).toHaveLength(1);
    expect(wrapper.html()).toMatch('Card title');
    expect(wrapper.html()).toMatch('Card content');
  });

  it('should not render title and content when it is not passed', function() {
    const wrapper = mount(<SpecialBlueCard />);
    expect(wrapper.find('h2').hostNodes().html()).toMatch('');
    expect(wrapper.find('span').hostNodes().html()).toMatch('');
  });
});
