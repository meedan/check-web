import React from 'react';
import { mountWithIntl } from '../../../test/unit/helpers/intl-test';
import { UploadFileComponent } from './UploadFile';

describe('<UploadFileComponent />', () => {
  const about = {
    file_max_size: '1M',
    upload_max_size: '1M',
    upload_extensions: [''],
    upload_max_dimensions: '1M',
    upload_min_dimensions: '1M',
    video_max_size: '1M',
    video_extensions: [''],
    audio_max_size: '1M',
    audio_extensions: [''],
    file_extensions: [''],
  };

  it('Should render if media type is audio', () => {
    const wrapper = mountWithIntl(<UploadFileComponent
      type="audio"
      about={about}
      value={null}
      onChange={() => {}}
      onError={() => {}}
    />);
    expect(wrapper.html()).toMatch('Drop an audio file here, or click to upload a file');
    expect(wrapper.find('.without-file').hostNodes()).toHaveLength(1);
  });

  it('Should render if media type is video', () => {
    const wrapper = mountWithIntl(<UploadFileComponent
      type="video"
      value={null}
      onChange={() => {}}
      about={about}
      onError={() => {}}
    />);
    expect(wrapper.html()).toMatch('Drop a video file here, or click to upload a file');
    expect(wrapper.find('.without-file').hostNodes()).toHaveLength(1);
  });

  it('Should render if media type is image', () => {
    const wrapper = mountWithIntl(<UploadFileComponent
      type="image"
      value={null}
      about={about}
      onChange={() => {}}
      onError={() => {}}
    />);
    expect(wrapper.html()).toMatch('Drop an image file here, or click to upload a file');
    expect(wrapper.find('.without-file').hostNodes()).toHaveLength(1);
  });

  it('Should render if media type is file', () => {
    const wrapper = mountWithIntl(<UploadFileComponent
      type="file"
      about={about}
      value={null}
      onChange={() => {}}
      onError={() => {}}
    />);
    expect(wrapper.html()).toMatch('Drop a file here, or click to upload a file');
    expect(wrapper.find('.without-file').hostNodes()).toHaveLength(1);
  });

  it('Should render if media type is image+video+audio', () => {
    const wrapper = mountWithIntl(<UploadFileComponent
      type="image+video+audio"
      value={null}
      about={about}
      onChange={() => {}}
      onError={() => {}}
    />);
    //
    expect(wrapper.html()).toMatch('Drop a file here, or click to upload a file');
    expect(wrapper.find('.without-file').hostNodes()).toHaveLength(1);
  });

  it('Should not render upload file message if already have a file', () => {
    const wrapper = mountWithIntl(<UploadFileComponent
      type="file"
      value={{ state: { file: 'file/path' } }}
      about={about}
      onChange={() => {}}
      onError={() => {}}
    />);
    expect(wrapper.html()).not.toMatch('Drop a file here, or click to upload a file');
    expect(wrapper.find('.with-file').hostNodes()).toHaveLength(1);
  });
});
