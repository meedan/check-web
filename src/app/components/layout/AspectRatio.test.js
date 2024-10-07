import React from 'react';
import { AspectRatio } from './AspectRatio';
// import { shallowWithIntl } from '../../../../test/unit/helpers/intl-test';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

describe('<AspectRatio />', () => {
  const mockIntl = {
    formatMessage: jest.fn(),
    formatHTMLMessage: jest.fn(),
    formatDate: jest.fn(),
    formatTime: jest.fn(),
    formatRelative: jest.fn(),
    formatNumber: jest.fn(),
    formatPlural: jest.fn(),
    now: jest.fn(),
  };


  it('should render the correct message for Alegre', () => {
    const projectMedia = {
      id: 'blue',
      show_warning_cover: true,
      dynamic_annotation_flag: {
        data: {
          show_cover: true,
          custom: {},
          flags: {
            adult: 0,
            spoof: 0,
            medical: 0,
            violence: 7,
            racy: 0,
            spam: 0,
          },
        },
        annotator: {
          name: 'Alegre',
          id: '7',
        },
        id: 'RHluYW1pYy8xODQ1\n',
      },
    };

    const wrapper = mountWithIntl(<AspectRatio
      children={<div>Test Child</div>}
      currentUserRole="editors"
      intl={mockIntl}
      projectMedia={projectMedia}
    />);
    // console.log(wrapper.html());
    // eslint-disable-next-line
    console.log(wrapper.debug());
    // eslint-disable-next-line
    console.log(wrapper.props());
    // expect(wrapper.html()).toMatch('An automation rule has detected this content as sensitive');
  });
});
