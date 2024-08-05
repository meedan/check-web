import React from 'react';
import { shallow } from 'enzyme';
import { MediaConfirmationBanner } from './MediaConfirmationBanner';

describe('<MediaConfirmationBanner />', () => {
  it('should render confirmation banner', () => {
    const wrapper = shallow(<MediaConfirmationBanner projectMedia={{ is_confirmed: true, confirmed_main_item: { id: 'UHJvamVjdE1lZGlhLzEK' } }} />);
    expect(wrapper.find('Alert')).toHaveLength(1);
  });

  it('should not render confirmation banner', () => {
    const wrapper = shallow(<MediaConfirmationBanner projectMedia={{ is_confirmed: false, confirmed_main_item: {} }} />);
    expect(wrapper.find('Alert')).toHaveLength(0);
  });
});
