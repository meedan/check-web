import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import { MediaExpandedArchivesTest } from './MediaExpandedArchives';

describe('<MediaExpandedArchives />', () => {
  const projectMedia = {
    archiver: {
      data: {
        fields: [
          {
            field_name: 'archive_is_response',
            value_json: {
              location: 'https://example.com/archive',
            },
          },
        ],
      },
    },
  };

  it('should render with the test archive', () => {
    const wrapper = mountWithIntl(<MediaExpandedArchivesTest
      projectMedia={projectMedia}
    />);

    expect(wrapper.find('ExternalLink').text()).toBe('Archive.is');
    expect(wrapper.find('ExternalLink').childAt(0).render().attr('href')).toBe('https://example.com/archive');
  });
});
