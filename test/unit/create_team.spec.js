import React from 'react';
import { IntlProvider } from 'react-intl';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';

import CreateTeamCard from '../../src/app/components/team/CreateTeamCard';

const intlProvider = new IntlProvider({ locale: 'en', messages: {} }, {});
const { intl } = intlProvider.getChildContext();

// Needed for onTouchTap
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

describe('<CreateTeamCard />', () => {
  it('creates a slug that contains Unicode alphanumeric chars only', function() {
    const createTeam = mountWithIntl(<CreateTeamCard />);
    const name = createTeam.find('#team-name-container');
    const slug = createTeam.find('#team-slug-container');
    expect(name).to.have.length(1);
    expect(slug).to.have.length(1);
    name.simulate('blur', { target: { value: 'this is a test 1234' } });
    expect(slug.get(0).value).to.equal('this-is-a-test-1234');
    name.simulate('blur', { target: { value: 'this should not reflect in the slug' } });
    expect(slug.get(0).value).to.equal('this-is-a-test-1234');
    slug.simulate('change', { target: { value: '' } });
    name.simulate('blur', { target: { value: 'No sympathy for 666 هختلثق !@#$% تاج' } });
    expect(slug.get(0).value).to.equal('no-sympathy-for-666-هختلثق-تاج');
  });
});
