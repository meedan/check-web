import React from 'react';
import { MediaOrigin } from './MediaOrigin';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import Person from '../../icons/person.svg';
import PersonAdd from '../../icons/person_add.svg';
import PersonCheck from '../../icons/person_check.svg';
import Bolt from '../../icons/bolt.svg';
import Tipline from '../../icons/question_answer.svg';
import CheckMediaOrigin from '../../constants/CheckMediaOrigin';

describe('<MediaOrigin />', () => {
  it('should render a button with the correct icon and message for each type', () => {
    const tiplineSubmitted = mountWithIntl(<MediaOrigin projectMedia={{ media_cluster_origin: CheckMediaOrigin.TIPLINE_SUBMITTED, media_cluster_origin_user: { name: 'Smooch' } }} />);
    expect(tiplineSubmitted.find(Tipline).length).toEqual(1);
    expect(tiplineSubmitted.html()).toMatch('Tipline Submitted');

    const userAdded = mountWithIntl(<MediaOrigin projectMedia={{ media_cluster_origin: CheckMediaOrigin.USER_ADDED, media_cluster_origin_user: { name: 'John Doe' } }} />);
    expect(userAdded.find(PersonAdd).length).toEqual(1);
    expect(userAdded.html()).toMatch('User Added');

    const userMerged = mountWithIntl(<MediaOrigin projectMedia={{ media_cluster_origin: CheckMediaOrigin.USER_MERGED, media_cluster_origin_user: { name: 'John Doe' } }} />);
    expect(userMerged.find(Person).length).toEqual(1);
    expect(userMerged.html()).toMatch('User Merged');

    const userMatched = mountWithIntl(<MediaOrigin projectMedia={{ media_cluster_origin: CheckMediaOrigin.USER_MATCHED, media_cluster_origin_user: { name: 'John Doe' } }} />);
    expect(userMatched.find(PersonCheck).length).toEqual(1);
    expect(userMatched.html()).toMatch('User Matched');

    const autoMatched = mountWithIntl(<MediaOrigin projectMedia={{ media_cluster_origin: CheckMediaOrigin.AUTO_MATCHED, media_cluster_origin_user: { name: 'Alegre' } }} />);
    expect(autoMatched.find(Bolt).length).toEqual(1);
    expect(autoMatched.html()).toMatch('Auto Matched');
  });

  it('should return null for invalid type', () => {
    const wrapper = mountWithIntl(<MediaOrigin projectMedia={{ media_cluster_origin: 99, media_cluster_origin_user: { name: 'user' } }} />);
    expect(wrapper.find('FormattedMessage').length).toEqual(0);
  });

  it('should not crash when media cluster origin and media cluster origin user are null', () => {
    const wrapper = mountWithIntl(<MediaOrigin projectMedia={{ media_cluster_origin: null, media_cluster_origin_user: null }} />);
    expect(wrapper.find('FormattedMessage').length).toEqual(0);
  });
});
