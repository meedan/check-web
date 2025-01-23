import React from 'react';
import MediaOrigin from './MediaOrigin';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import Person from '../../icons/person.svg';
import PersonAdd from '../../icons/person_add.svg';
import PersonCheck from '../../icons/person_check.svg';
import Bolt from '../../icons/bolt.svg';
import Tipline from '../../icons/question_answer.svg';
import CheckMediaOrigin from '../../CheckMediaOrigin';

describe('<MediaOrigin />', () => {
  it('should render a button with the correct icon and message for each type', () => {
    const tiplineSubmitted = mountWithIntl(<MediaOrigin origin={CheckMediaOrigin.TIPLINE_SUBMITTED} user="Smooch" />);
    expect(tiplineSubmitted.find(Tipline).length).toEqual(1);
    expect(tiplineSubmitted.html()).toMatch('Tipline Submitted');

    const userAdded = mountWithIntl(<MediaOrigin origin={CheckMediaOrigin.USER_ADDED} user="John Doe" />);
    expect(userAdded.find(PersonAdd).length).toEqual(1);
    expect(userAdded.html()).toMatch('User Added');

    const userMerged = mountWithIntl(<MediaOrigin origin={CheckMediaOrigin.USER_MERGED} user="John Doe" />);
    expect(userMerged.find(Person).length).toEqual(1);
    expect(userMerged.html()).toMatch('User Merged');

    const userMatched = mountWithIntl(<MediaOrigin origin={CheckMediaOrigin.USER_MATCHED} user="John Doe" />);
    expect(userMatched.find(PersonCheck).length).toEqual(1);
    expect(userMatched.html()).toMatch('User Matched');

    const autoMatched = mountWithIntl(<MediaOrigin origin={CheckMediaOrigin.AUTO_MATCHED} user="Alegre" />);
    expect(autoMatched.find(Bolt).length).toEqual(1);
    expect(autoMatched.html()).toMatch('Auto Matched');
  });

  it('should return null for invalid type', () => {
    const wrapper = mountWithIntl(<MediaOrigin origin={99} user="user" />);
    expect(wrapper.find('FormattedMessage').length).toEqual(0);
  });
});
