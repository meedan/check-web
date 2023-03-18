import React from 'react';
import { shallow } from 'enzyme';
import {
  IconButton,
} from '@material-ui/core';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import MediaVolume from './MediaVolume';

describe('MediaVolume', () => {
  // our "video" DOM node, which is just a ref to a volume from the perspective of this component
  const videoRef = {
    current: {
      volume: 0.75,
    },
  };

  const defaultProps = {
    videoRef,
    volume: 0.75,
    setVolume: () => {},
  };

  it('renders without crashing', () => {
    const wrapper = shallow(<MediaVolume {...defaultProps} />);
    expect(wrapper.find('#media-volume')).toHaveLength(1);
    expect(wrapper.find('#media-volume-slider').prop('value')).toEqual(0.75);
  });

  it('toggles icon state when clicking volume icon', () => {
    const wrapper = shallow(<MediaVolume {...defaultProps} />);
    expect(wrapper.find(IconButton)).toHaveLength(1);
    expect(wrapper.find(VolumeUpIcon)).toHaveLength(1);
    wrapper.find(IconButton).at(0).simulate('click');
    expect(wrapper.find(VolumeOffIcon)).toHaveLength(1);
  });

  it('toggles volume icon state when setting volume to 0 via slider', () => {
    const wrapper = shallow(<MediaVolume {...defaultProps} />);
    expect(wrapper.find(VolumeUpIcon)).toHaveLength(1);
    expect(wrapper.find(VolumeOffIcon)).toHaveLength(0);
    wrapper.find('#media-volume-slider').at(0).simulate('change', {}, 0);
    expect(wrapper.find(VolumeUpIcon)).toHaveLength(0);
    expect(wrapper.find(VolumeOffIcon)).toHaveLength(1);
  });

  it('returns volume to prior state when toggling volume icon', () => {
    const wrapper = shallow(<MediaVolume {...defaultProps} />);
    wrapper.find('#media-volume-slider').at(0).simulate('change', {}, 0.3);
    // volume off
    wrapper.find(IconButton).at(0).simulate('click');
    expect(videoRef.current.volume).toEqual(0);
    // restore volume
    wrapper.find(IconButton).at(0).simulate('click');
    expect(videoRef.current.volume).toEqual(0.3);
  });
});
