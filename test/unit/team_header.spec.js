import React from 'react';
import { Link } from 'react-router';
import { render, shallow, mount } from 'enzyme';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';

import TeamHeader from '../../src/app/components/team/TeamHeader';

describe('<TeamHeader />', () => {
  const params = { team: 'team-slug' };

  it('links to team through top link', function() {
    const teamHeader = mountWithIntl(<TeamHeader params={params} />);
    expect(teamHeader.find(Link).props()).to.have.property('to', '/team-slug');
  });
});
