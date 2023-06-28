import React from 'react';
import { mount } from 'enzyme';
import Card from './Card';

describe('<Card />', () => {
  it('should render Card component', () => {
    const cardComponent = mount(<Card title="Test" />);
    const card = cardComponent.find('.card');
    expect(card).toHaveLength(1);
  });

  it('should render clickable card', () => {
    const cardComponent = mount(<Card title="Test" url="https://meedan.com" />);
    const card = cardComponent.find('.card a');
    expect(card).toHaveLength(1);
  });

  it('should render non-clickable card', () => {
    const cardComponent = mount(<Card title="Test" url={null} />);
    const card = cardComponent.find('.card a');
    expect(card).toHaveLength(0);
  });
});
