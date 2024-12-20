import React from 'react';
import MediaClusterOriginButton from './MediaClusterOriginButton';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import Person from '../../icons/person.svg';
import PersonAdd from '../../icons/person_add.svg';
import PersonCheck from '../../icons/person_check.svg';
import Bolt from '../../icons/bolt.svg';
import Tipline from '../../icons/question_answer.svg';

describe('<MediaClusterOriginButton />', () => {
  it('should render a button with the correct icon and message for each type', () => {
    const userMerged = mountWithIntl(<MediaClusterOriginButton type="typeA" />);
    expect(userMerged.find(Person).length).toEqual(1);
    expect(userMerged.html()).toMatch('User Merged');

    const userMatched = mountWithIntl(<MediaClusterOriginButton type="typeB" />);
    expect(userMatched.find(PersonCheck).length).toEqual(1);
    expect(userMatched.html()).toMatch('User Matched');


    const userAdded = mountWithIntl(<MediaClusterOriginButton type="typeC" />);
    expect(userAdded.find(PersonAdd).length).toEqual(1);
    expect(userAdded.html()).toMatch('User Added');

    const tiplineSubmitted = mountWithIntl(<MediaClusterOriginButton type="typeD" />);
    expect(tiplineSubmitted.find(Tipline).length).toEqual(1);
    expect(tiplineSubmitted.html()).toMatch('Tipline Submitted');

    const autoMatched = mountWithIntl(<MediaClusterOriginButton type="typeE" />);
    expect(autoMatched.find(Bolt).length).toEqual(1);
    expect(autoMatched.html()).toMatch('Auto Matched');
  });


  it('should return null for invalid type', () => {
    const wrapper = mountWithIntl(<MediaClusterOriginButton type="invalidType" />);
    expect(wrapper.find('FormattedMessage').length).toEqual(0);
  });
});
