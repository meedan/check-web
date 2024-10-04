import React from 'react';
import { shallow } from 'enzyme';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MediaPlaybackSpeed from './MediaPlaybackSpeed';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';

describe('MediaPlaybackSpeed', () => {
  // our "video" DOM node, which is just a ref to a playbackRate from the perspective of this component
  const videoRef = {
    current: {
      playbackRate: 1.0,
    },
  };

  const defaultProps = {
    videoRef,
    playbackSpeed: 1.0,
    setPlaybackSpeed: () => {},
  };

  it('renders without crashing', () => {
    const wrapper = shallow(<MediaPlaybackSpeed {...defaultProps} />);
    expect(wrapper.find('#media-playback-speed')).toHaveLength(1);
  });

  it('opens popover menu on click', () => {
    const wrapper = shallow(<MediaPlaybackSpeed {...defaultProps} />);
    expect(wrapper.find(Menu).props().open).toBeFalsy();
    expect(wrapper.find(ButtonMain)).toHaveLength(1);
    wrapper.find(ButtonMain).at(0).simulate('click', { currentTarget: 1 });
    expect(wrapper.find(Menu).props().open).toBeTruthy();
  });

  it('changes selected menu item based on mounted speed', () => {
    const wrapper = shallow(<MediaPlaybackSpeed {...defaultProps} playbackSpeed={0.5} />);
    expect(wrapper.find('.test-active-playback-speed').at(0).text()).toEqual('0.5x');
  });

  it('changes video speed based on menu selections', () => {
    const wrapper = shallow(<MediaPlaybackSpeed {...defaultProps} />);
    // select the first item (0.25x speed);
    wrapper.find(MenuItem).at(0).simulate('click');
    expect(videoRef.current.playbackRate).toEqual(0.25);
    // select the last item (2x speed);
    wrapper.find(MenuItem).last().simulate('click');
    expect(videoRef.current.playbackRate).toEqual(2);
  });
});
