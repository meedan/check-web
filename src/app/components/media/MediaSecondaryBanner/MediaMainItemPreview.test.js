import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import { MediaMainItemPreview } from './MediaMainItemPreview';

const projectMedia = {
  title: 'Foo bar',
  full_url: 'http://localhost/test/1',
  show_warning_cover: false,
  media: {
    picture: '',
    type: 'Claim',
    url: '',
  },
};

describe('<MediaMainItemPreview />', () => {
  it('should render preview of the main media item', () => {
    const wrapper = mountWithIntl(<MediaMainItemPreview projectMedia={projectMedia} />);
    expect(wrapper.html()).toMatch('Foo bar');
  });
});
