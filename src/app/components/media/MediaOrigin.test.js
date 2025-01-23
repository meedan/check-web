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
    const tiplineSubmitted = mountWithIntl(<MediaOrigin mediaClusterOrigin={CheckMediaOrigin.TIPLINE_SUBMITTED} mediaClusterOriginUser="Smooch" />);
    expect(tiplineSubmitted.find(Tipline).length).toEqual(1);
    expect(tiplineSubmitted.html()).toMatch('Tipline Submitted');

    const userAdded = mountWithIntl(<MediaOrigin mediaClusterOrigin={CheckMediaOrigin.USER_ADDED} mediaClusterOriginUser="John Doe" />);
    expect(userAdded.find(PersonAdd).length).toEqual(1);
    expect(userAdded.html()).toMatch('User Added');

    const userMerged = mountWithIntl(<MediaOrigin mediaClusterOrigin={CheckMediaOrigin.USER_MERGED} mediaClusterOriginUser="John Doe" />);
    expect(userMerged.find(Person).length).toEqual(1);
    expect(userMerged.html()).toMatch('User Merged');

    const userMatched = mountWithIntl(<MediaOrigin mediaClusterOrigin={CheckMediaOrigin.USER_MATCHED} mediaClusterOriginUser="John Doe" />);
    expect(userMatched.find(PersonCheck).length).toEqual(1);
    expect(userMatched.html()).toMatch('User Matched');

    const autoMatched = mountWithIntl(<MediaOrigin mediaClusterOrigin={CheckMediaOrigin.AUTO_MATCHED} mediaClusterOriginUser="Alegre" />);
    expect(autoMatched.find(Bolt).length).toEqual(1);
    expect(autoMatched.html()).toMatch('Auto Matched');
  });

  it('should return null for invalid type', () => {
    const wrapper = mountWithIntl(<MediaOrigin mediaClusterOrigin={99} mediaClusterOriginUser="user" />);
    expect(wrapper.find('FormattedMessage').length).toEqual(0);
  });
});
