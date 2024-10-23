import React from 'react';
import { UploadFileComponent } from './UploadFile';
import { mountWithIntl } from '../../../test/unit/helpers/intl-test';

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
      about={about}
      type="audio"
      value={null}
      onChange={() => {}}
      onError={() => {}}
    />);
    expect(wrapper.html()).toMatch('Click or drag an audio file here to upload.');
    expect(wrapper.find('.int-uploadfile__dropzone-without-file').hostNodes()).toHaveLength(1);
  });

  it('Should render if media type is video', () => {
    const wrapper = mountWithIntl(<UploadFileComponent
      about={about}
      type="video"
      value={null}
      onChange={() => {}}
      onError={() => {}}
    />);
    expect(wrapper.html()).toMatch('Click or drag a video file here to upload.');
    expect(wrapper.find('.int-uploadfile__dropzone-without-file').hostNodes()).toHaveLength(1);
  });

  it('Should render if media type is image', () => {
    const wrapper = mountWithIntl(<UploadFileComponent
      about={about}
      type="image"
      value={null}
      onChange={() => {}}
      onError={() => {}}
    />);
    expect(wrapper.html()).toMatch('Click or drag an image here to upload.');
    expect(wrapper.find('.int-uploadfile__dropzone-without-file').hostNodes()).toHaveLength(1);
  });

  it('Should render if media type is file', () => {
    const wrapper = mountWithIntl(<UploadFileComponent
      about={about}
      type="file"
      value={null}
      onChange={() => {}}
      onError={() => {}}
    />);
    expect(wrapper.html()).toMatch('Click or drag a file here to upload.');
    expect(wrapper.find('.int-uploadfile__dropzone-without-file').hostNodes()).toHaveLength(1);
  });

  it('Should render if media type is image+video+audio', () => {
    const wrapper = mountWithIntl(<UploadFileComponent
      about={about}
      type="image+video+audio"
      value={null}
      onChange={() => {}}
      onError={() => {}}
    />);
    //
    expect(wrapper.html()).toMatch('Click or drag a file here to upload.');
    expect(wrapper.find('.int-uploadfile__dropzone-without-file').hostNodes()).toHaveLength(1);
  });

  it('Should not render upload file message if already have a file', () => {
    const wrapper = mountWithIntl(<UploadFileComponent
      about={about}
      type="file"
      value={{ state: { file: 'file/path' } }}
      onChange={() => {}}
      onError={() => {}}
    />);
    expect(wrapper.html()).not.toMatch('Click or drag a file here to upload.');
    expect(wrapper.find('.int-uploadfile__dropzone-with-file').hostNodes()).toHaveLength(1);
  });
});
