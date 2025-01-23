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
  const mediaClusterOriginTimestamp = 1736876257;
  const mediaClusterRelationship = { confirmed_by: { name: 'Cluster A' }, target: { title: 'Cluster B' } };
  const mediaClusterOriginUser = 'Bruce';
  it('should render a banner with the correct icon and message for each type', () => {
    const tiplineSubmitted = mountWithIntl(<MediaBanner mediaClusterOrigin={CheckMediaOrigin.TIPLINE_SUBMITTED} mediaClusterOriginTimestamp={mediaClusterOriginTimestamp} mediaClusterOriginUser={mediaClusterOriginUser} mediaClusterRelationship={mediaClusterRelationship} />);
    expect(tiplineSubmitted.find(Tipline).length).toEqual(1);
    expect(tiplineSubmitted.html()).toContain('This media was submitted via <strong>Tipline</strong>');

    const userAdded = mountWithIntl(<MediaBanner mediaClusterOrigin={CheckMediaOrigin.USER_ADDED} mediaClusterOriginTimestamp={mediaClusterOriginTimestamp} mediaClusterOriginUser={mediaClusterOriginUser} mediaClusterRelationship={mediaClusterRelationship} />);
    expect(userAdded.find(PersonAdd).length).toEqual(1);
    expect(userAdded.html()).toContain('This media was added to the cluster of media by');

    const userMerged = mountWithIntl(<MediaBanner mediaClusterOrigin={CheckMediaOrigin.USER_MERGED} mediaClusterOriginTimestamp={mediaClusterOriginTimestamp} mediaClusterOriginUser={mediaClusterOriginUser} mediaClusterRelationship={mediaClusterRelationship} />);
    expect(userMerged.find(Person).length).toEqual(1);
    expect(userMerged.html()).toContain('his media was merged into this cluster of media by');

    const userMatched = mountWithIntl(<MediaBanner mediaClusterOrigin={CheckMediaOrigin.USER_MATCHED} mediaClusterOriginTimestamp={mediaClusterOriginTimestamp} mediaClusterOriginUser={mediaClusterOriginUser} mediaClusterRelationship={mediaClusterRelationship} />);
    expect(userMatched.find(PersonCheck).length).toEqual(1);
    expect(userMatched.html()).toContain('This media was added to the cluster of media by');

    const autoMatched = mountWithIntl(<MediaBanner mediaClusterOrigin={CheckMediaOrigin.AUTO_MATCHED} mediaClusterOriginTimestamp={mediaClusterOriginTimestamp} mediaClusterOriginUser={mediaClusterOriginUser} mediaClusterRelationship={mediaClusterRelationship} />);
    expect(autoMatched.find(Bolt).length).toEqual(1);
    expect(autoMatched.html()).toContain('This media was automatically matched to the cluster of media,');
  });

  it('should return null for invalid type', () => {
    const wrapper = mountWithIntl(<MediaBanner mediaClusterOrigin={99} mediaClusterOriginTimestamp={mediaClusterOriginTimestamp} mediaClusterOriginUser={mediaClusterOriginUser} mediaClusterRelationship={mediaClusterRelationship} />);
    expect(wrapper.find('FormattedMessage').length).toEqual(0);
  });
});
