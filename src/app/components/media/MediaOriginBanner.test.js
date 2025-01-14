import React from 'react';
import MediaBanner from './MediaOriginBanner';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import Person from '../../icons/person.svg';
import PersonAdd from '../../icons/person_add.svg';
import PersonCheck from '../../icons/person_check.svg';
import Bolt from '../../icons/bolt.svg';
import Tipline from '../../icons/question_answer.svg';
import CheckMediaOrigin from '../../CheckMediaOrigin';

describe('<MediaBanner />', () => {
  const timestamp = 1736876257; // Pass timestamp as a number
  const cluster = 'Cluster A';
  const user = 'Bruce';
  it('should render a banner with the correct icon and message for each type', () => {
    const tiplineSubmitted = mountWithIntl(<MediaBanner cluster={cluster} timestamp={timestamp} type={CheckMediaOrigin.TIPLINE_SUBMITTED} user={user} />);
    expect(tiplineSubmitted.find(Tipline).length).toEqual(1);
    expect(tiplineSubmitted.html()).toContain('This media was submitted via <strong>Tipline</strong>');

    const userAdded = mountWithIntl(<MediaBanner cluster={cluster} timestamp={timestamp} type={CheckMediaOrigin.USER_ADDED} user={user} />);
    expect(userAdded.find(PersonAdd).length).toEqual(1);
    expect(userAdded.html()).toContain('This media was added to the cluster by');

    const userMerged = mountWithIntl(<MediaBanner cluster={cluster} timestamp={timestamp} type={CheckMediaOrigin.USER_MERGED} user={user} />);
    expect(userMerged.find(Person).length).toEqual(1);
    expect(userMerged.html()).toContain('This media was added to the cluster by');

    const userMatched = mountWithIntl(<MediaBanner cluster={cluster} timestamp={timestamp} type={CheckMediaOrigin.USER_MATCHED} user={user} />);
    expect(userMatched.find(PersonCheck).length).toEqual(1);
    expect(userMatched.html()).toContain('This media was added to the cluster by');

    const autoMatched = mountWithIntl(<MediaBanner cluster={cluster} timestamp={timestamp} type={CheckMediaOrigin.AUTO_MATCHED} user={user} />);
    expect(autoMatched.find(Bolt).length).toEqual(1);
    expect(autoMatched.html()).toContain('This media was automatically matched to the cluster');
  });

  it('should return null for invalid type', () => {
    const wrapper = mountWithIntl(<MediaBanner cluster={cluster} timestamp={timestamp} type={99} user={user} />);
    expect(wrapper.find('FormattedMessage').length).toEqual(0);
  });
});
