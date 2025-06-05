import React from 'react';
import { shallow } from 'enzyme';
import MediaTypeDisplayIcon, { mediaTypeFromFilename, mediaTypeFromUrl } from './MediaTypeDisplayIcon';
import CheckMediaTypes from '../../constants/CheckMediaTypes';

describe('<MediaTypeDisplayIcon />', () => {
  it('should return icon', () => {
    const wrapper = shallow(<MediaTypeDisplayIcon mediaType={CheckMediaTypes.UPLOADEDAUDIO} />);
    expect(wrapper.find('svg')).toHaveLength(1);
  });

  it('mediaTypeFromFilename should return correct type', () => {
    let type = mediaTypeFromFilename('foo.jpeg');
    expect(type).toEqual(CheckMediaTypes.UPLOADEDIMAGE);

    type = mediaTypeFromFilename('bli.wav');
    expect(type).toEqual(CheckMediaTypes.UPLOADEDAUDIO);
  });

  it('mediaTypeFromUrl should return correct type', () => {
    let type = mediaTypeFromUrl('https://www.youtube.com/watch?v=IxMtrololoSFs');
    expect(type).toEqual(CheckMediaTypes.YOUTUBE);

    type = mediaTypeFromUrl('https://twitter.com/wbalasdfy/status/170bliblo33468');
    expect(type).toEqual(CheckMediaTypes.TWITTER);

    type = mediaTypeFromUrl('https://x.com/wbalasdfy/status/170bliblo33468');
    expect(type).toEqual(CheckMediaTypes.TWITTER);

    type = mediaTypeFromUrl('https://www.facebook.com/ioushdfuhm/posts/piriripororo');
    expect(type).toEqual(CheckMediaTypes.FACEBOOK);

    type = mediaTypeFromUrl('https://fb.watch/mu2vASDFgs-g/');
    expect(type).toEqual(CheckMediaTypes.FACEBOOK);

    type = mediaTypeFromUrl('https://t.me/tchucniasjfd/118234');
    expect(type).toEqual(CheckMediaTypes.TELEGRAM);

    type = mediaTypeFromUrl('https://www.tiktok.com/poijasdf/112342348234');
    expect(type).toEqual(CheckMediaTypes.TIKTOK);
  });
});
