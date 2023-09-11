import React from 'react';
import { mountWithIntl } from '../../../../../test/unit/helpers/intl-test';
import ProjectsListCounter from './ProjectsListCounter';

describe('<ProjectsListCounter />', () => {
  it('renders nothing if numberOfItems is not a number', () => {
    const counter = mountWithIntl(<ProjectsListCounter numberOfItems="test" />);
    expect(counter.find('small').text()).toEqual('');
  });


  it('renders a small number as is', () => {
    const counter = mountWithIntl(<ProjectsListCounter numberOfItems={12} />);
    expect(counter.find('small').text()).toEqual('12');
  });

  it('makes long numbers shorter', () => {
    const counter = mountWithIntl(<ProjectsListCounter numberOfItems={12345} />);
    expect(counter.find('small').text()).toEqual('12K');
  });
});
