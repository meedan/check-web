import React from 'react';
import MediaBanner from './MediaBanner';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import Person from '../../icons/person.svg';
import PersonAdd from '../../icons/person_add.svg';
import PersonCheck from '../../icons/person_check.svg';
import Bolt from '../../icons/bolt.svg';
import Tipline from '../../icons/question_answer.svg';
import CheckMediaOrigin from '../../CheckMediaOrigin';

describe('<MediaBanner />', () => {
  it('should render a banner with the correct icon and message for each type', () => {
    const datetime = '2023-12-15T17:19:40Z';
    const cluster = 'Cluster A';

    const tiplineSubmitted = mountWithIntl(<MediaBanner cluster={cluster} datetime={datetime} type={CheckMediaOrigin.TIPLINE_SUBMITTED} />);
    expect(tiplineSubmitted.find(Tipline).length).toEqual(1);
    expect(tiplineSubmitted.html()).toMatch('This media was submitted via <strong>Tipline</strong> on');

    const userAdded = mountWithIntl(<MediaBanner cluster={cluster} datetime={datetime} type={CheckMediaOrigin.USER_ADDED} user="John Doe" />);
    expect(userAdded.find(PersonAdd).length).toEqual(1);
    expect(userAdded.html()).toMatch('This media was added to the cluster by <strong>John Doe</strong> on');

    const userMerged = mountWithIntl(<MediaBanner cluster={cluster} datetime={datetime} type={CheckMediaOrigin.USER_MERGED} user="John Doe" />);
    expect(userMerged.find(Person).length).toEqual(1);
    expect(userMerged.html()).toMatch('This media was added to the cluster by <strong>John Doe</strong> when merged from');

    const userMatched = mountWithIntl(<MediaBanner cluster={cluster} datetime={datetime} type={CheckMediaOrigin.USER_MATCHED} user="John Doe" />);
    expect(userMatched.find(PersonCheck).length).toEqual(1);
    expect(userMatched.html()).toMatch('This media was added to the cluster by <strong>John Doe</strong> when accpeted from');

    const autoMatched = mountWithIntl(<MediaBanner cluster={cluster} datetime={datetime} type={CheckMediaOrigin.AUTO_MATCHED} />);
    expect(autoMatched.find(Bolt).length).toEqual(1);
    expect(autoMatched.html()).toMatch('This media was automatically matched to the cluster.');
  });


  it('should return null for invalid type', () => {
    const datetime = '2023-12-15T17:19:40Z';
    const cluster = 'Cluster A';
    const wrapper = mountWithIntl(<MediaBanner cluster={cluster} datetime={datetime} type={99} />);
    expect(wrapper.find('FormattedMessage').length).toEqual(0);
  });
});
