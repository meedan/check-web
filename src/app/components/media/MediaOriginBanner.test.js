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
  const originTimestamp = 1736876257;
  const mediaClusterRelationship = { confirmed_by: { name: 'Cluster A' }, target: { title: 'Cluster B' } };
  const user = 'Bruce';
  it('should render a banner with the correct icon and message for each type', () => {
    const tiplineSubmitted = mountWithIntl(<MediaBanner mediaClusterRelationship={mediaClusterRelationship} origin={CheckMediaOrigin.TIPLINE_SUBMITTED} originTimestamp={originTimestamp} user={user} />);
    expect(tiplineSubmitted.find(Tipline).length).toEqual(1);
    expect(tiplineSubmitted.html()).toContain('This media was submitted via <strong>Tipline</strong>');

    const userAdded = mountWithIntl(<MediaBanner mediaClusterRelationship={mediaClusterRelationship} origin={CheckMediaOrigin.USER_ADDED} originTimestamp={originTimestamp} user={user} />);
    expect(userAdded.find(PersonAdd).length).toEqual(1);
    expect(userAdded.html()).toContain('This media was added to the cluster of media by');

    const userMerged = mountWithIntl(<MediaBanner mediaClusterRelationship={mediaClusterRelationship} origin={CheckMediaOrigin.USER_MERGED} originTimestamp={originTimestamp} user={user} />);
    expect(userMerged.find(Person).length).toEqual(1);
    expect(userMerged.html()).toContain('his media was merged into this cluster of media by');

    const userMatched = mountWithIntl(<MediaBanner mediaClusterRelationship={mediaClusterRelationship} origin={CheckMediaOrigin.USER_MATCHED} originTimestamp={originTimestamp} user={user} />);
    expect(userMatched.find(PersonCheck).length).toEqual(1);
    expect(userMatched.html()).toContain('This media was added to the cluster of media by');

    const autoMatched = mountWithIntl(<MediaBanner mediaClusterRelationship={mediaClusterRelationship} origin={CheckMediaOrigin.AUTO_MATCHED} originTimestamp={originTimestamp} user={user} />);
    expect(autoMatched.find(Bolt).length).toEqual(1);
    expect(autoMatched.html()).toContain('This media was automatically matched to the cluster of media');
  });

  it('should return null for invalid type', () => {
    const wrapper = mountWithIntl(<MediaBanner mediaClusterRelationship={mediaClusterRelationship} origin={99} originTimestamp={originTimestamp} user={user} />);
    expect(wrapper.find('FormattedMessage').length).toEqual(0);
  });
});
