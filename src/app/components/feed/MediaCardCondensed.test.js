import React from 'react';
import { MediaCardCondensed } from './MediaCardCondensed';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';

describe('<MediaCardCondensed />', () => {
  it('UploadedAudio should use default image as thumbnail', () => {
    const media = {
      type: 'UploadedAudio',
      file_path: 'foobar',
    };
    const component = mountWithIntlProvider((
      <MediaCardCondensed
        title="audio-Test-Feed-1"
        media={media}
      />
    ));
    expect(component.html()).toMatch('/images/image_placeholder.svg');
  });
});
