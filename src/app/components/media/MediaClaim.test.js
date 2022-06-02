import React from 'react';
import MediaClaim from './MediaClaim';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';

const projectMedia = {
  team: { smooch_bot: { bla: 1 } },
  permissions: '{"create Media":true}',
  claim_description: {
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
    user: { name: 'Loren User test' },
    updated_at: '1653586249',
  },
  report: { data: { state: 'published' } },
};

describe('<MediaClaim>', () => {
  it('should render input fields', () => {
    const wrapper = mountWithIntl(<MediaClaim projectMedia={projectMedia} />);
    expect(wrapper.find('#media__claim-title').hostNodes()).toHaveLength(1);
    expect(wrapper.find('#media-claim__description').hostNodes()).toHaveLength(1);
  });

  it('should render who last saved the claim and when it happened', () => {
    const wrapper = mountWithIntl(<MediaClaim projectMedia={projectMedia} />);
    expect(wrapper.html()).toMatch('saved by Loren User test');
    expect(wrapper.find('time').text()).toContain('May 26, 2022');
  });
});
