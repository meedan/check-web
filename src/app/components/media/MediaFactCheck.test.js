import React from 'react';
import { shallow } from 'enzyme';
import MediaFactCheck from './MediaFactCheck';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

const projectMedia = {
  team: { smooch_bot: { bla: 1 } },
  permissions: '{"create Media":true, "create ClaimDescription": true}',
  claim_description: {
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
  },
  report: { data: { state: 'published' } },
};

const projectMedia2 = {
  permissions: '{"create Media":true, "create ClaimDescription": true}',
  team: {},
  claim_description: { description: 'description' },
};

const projectMedia3 = {
  team: { smooch_bot: { bla: 1 } },
  permissions: '{"create Media":true, "create ClaimDescription": true}',
  claim_description: { description: 'description' },
  report: { data: { state: 'unpublished' } },
};

describe('<MediaFactCheck>', () => {
  it('should render fact check input fields', () => {
    const wrapper = mountWithIntl(<MediaFactCheck projectMedia={projectMedia} />);
    expect(wrapper.find('#media__fact-check-title').hostNodes()).toHaveLength(1);
    expect(wrapper.find('#media-fact-check__summary').hostNodes()).toHaveLength(1);
    expect(wrapper.find('#media-fact-check__url').hostNodes()).toHaveLength(1);
  });

  it('should render report button when team has smooch bot installed', () => {
    const wrapper = shallow(<MediaFactCheck projectMedia={projectMedia} />);
    expect(wrapper.find('.media-fact-check__report-designer')).toHaveLength(1);
  });

  it('should not render report button when team has not smooch bot installed', () => {
    const wrapper = shallow(<MediaFactCheck projectMedia={projectMedia2} />);
    expect(wrapper.find('.media-fact-check__report-designer')).toHaveLength(0);
  });

  it('should render published text button when report is published', () => {
    const wrapper = mountWithIntl(<MediaFactCheck projectMedia={projectMedia} />);
    expect(wrapper.find('.media-fact-check__report-designer').find('.MuiButton-label').find('span').first()
      .text()).toEqual('Published report');
  });

  it('should render unpublished text button when report is not published', () => {
    const wrapper = mountWithIntl(<MediaFactCheck projectMedia={projectMedia3} />);
    expect(wrapper.find('.media-fact-check__report-designer').find('.MuiButton-label').find('span').first()
      .text()).toEqual('Unpublished report');
  });
});
