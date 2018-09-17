import React from 'react';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';

import CreateTeamCard from '../../src/app/components/team/CreateTeamCard';

describe('<CreateTeamCard />', () => {
  it('creates a slug that contains Unicode alphanumeric chars only', function() {
    const createTeam = mountWithIntl(<CreateTeamCard />);
    const name = createTeam.find('#team-name-container').at(1);
    let slug = createTeam.find('#team-slug-container').at(1);

    expect(name).to.have.length(1);
    expect(slug).to.have.length(1);

    name.simulate('blur', { target: { value: 'this is a test 1234' } });
    createTeam.update();

    slug = createTeam.find('#team-slug-container').at(1); // need to find again after update
    expect(slug.get(0).props.value).to.equal('this-is-a-test-1234');

    name.simulate('blur', { target: { value: 'this should not reflect in the slug' } });
    createTeam.update();

    slug = createTeam.find('#team-slug-container').at(1);  // need to find again after update
    expect(slug.get(0).props.value).to.equal('this-is-a-test-1234');

    slug.simulate('change', { target: { value: '' } });
    createTeam.update();
    name.simulate('blur', { target: { value: 'No sympathy for 666 هختلثق !@#$% تاج' } });
    createTeam.update();

    slug = createTeam.find('#team-slug-container').at(1);  // need to find again after update
    expect(slug.get(0).props.value).to.equal('no-sympathy-for-666-هختلثق-تاج');
  });
});
