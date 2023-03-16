import React from 'react';
import MediaPreview from './MediaPreview';
import MediaPlayerCard from '../media/MediaPlayerCard';
import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<MediaPreview />', () => {
  it('should display image', () => {
    const media = { picture: 'foo' };
    const component = shallowWithIntl(<MediaPreview media={media} />);
    expect(component.find('img').length).toEqual(1);
  });

  it('should show player for UploadedVideo', () => {
    const media = {
      type: 'UploadedVideo',
      file_path: 'foobar',
    };
    const component = shallowWithIntl(<MediaPreview media={media} />);
    expect(component.find(MediaPlayerCard).length).toEqual(1);
  });

  it('should show player for UploadedAudio', () => {
    const media = {
      type: 'UploadedAudio',
      file_path: 'foobar',
    };
    const component = shallowWithIntl(<MediaPreview media={media} />);
    expect(component.find(MediaPlayerCard).length).toEqual(1);
  });

  it('UploadedAudio should use default coverImage', () => {
    const media = {
      type: 'UploadedAudio',
      file_path: 'foobar',
    };
    const component = shallowWithIntl(<MediaPreview media={media} />);
    expect(component.find(MediaPlayerCard).prop('coverImage')).toEqual('/images/player_cover.svg');
  });

  it('should show player for Youtube links', () => {
    const media = {
      type: 'Link',
      domain: 'youtube.com',
      url: 'https://www.youtube.com/watch?v=e_u0PMKAvN1',
    };
    const component = shallowWithIntl(<MediaPreview media={media} />);
    expect(component.find(MediaPlayerCard).length).toEqual(1);
  });
});
