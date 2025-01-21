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
  const media_cluster_origin_timestamp = 1736876257;
  const media_cluster_relationship ={ confirmed_by: {name: 'Cluster A'}, target: { title: 'Cluster B' }};
  const media_cluster_origin_user = 'Bruce';
  it('should render a banner with the correct icon and message for each type', () => {
    const tiplineSubmitted = mountWithIntl(<MediaBanner media_cluster_relationship={media_cluster_relationship} media_cluster_origin_timestamp={media_cluster_origin_timestamp} media_cluster_origin={CheckMediaOrigin.TIPLINE_SUBMITTED} media_cluster_origin_user={media_cluster_origin_user} />);
    expect(tiplineSubmitted.find(Tipline).length).toEqual(1);
    expect(tiplineSubmitted.html()).toContain('This media was submitted via <strong>Tipline</strong>');

    const userAdded = mountWithIntl(<MediaBanner media_cluster_relationship={media_cluster_relationship} media_cluster_origin_timestamp={media_cluster_origin_timestamp} media_cluster_origin={CheckMediaOrigin.USER_ADDED} media_cluster_origin_user={media_cluster_origin_user} />);
    expect(userAdded.find(PersonAdd).length).toEqual(1);
    expect(userAdded.html()).toContain('This media was added to the cluster by');

    const userMerged = mountWithIntl(<MediaBanner media_cluster_relationship={media_cluster_relationship} media_cluster_origin_timestamp={media_cluster_origin_timestamp} media_cluster_origin={CheckMediaOrigin.USER_MERGED} media_cluster_origin_user={media_cluster_origin_user} />);
    expect(userMerged.find(Person).length).toEqual(1);
    expect(userMerged.html()).toContain('This media was merged to the cluster by');

    const userMatched = mountWithIntl(<MediaBanner media_cluster_relationship={media_cluster_relationship} media_cluster_origin_timestamp={media_cluster_origin_timestamp} media_cluster_origin={CheckMediaOrigin.USER_MATCHED} media_cluster_origin_user={media_cluster_origin_user} />);
    expect(userMatched.find(PersonCheck).length).toEqual(1);
    expect(userMatched.html()).toContain('This media was added to the cluster by');

    const autoMatched = mountWithIntl(<MediaBanner media_cluster_relationship={media_cluster_relationship} media_cluster_origin_timestamp={media_cluster_origin_timestamp} media_cluster_origin={CheckMediaOrigin.AUTO_MATCHED} media_cluster_origin_user={media_cluster_origin_user} />);
    expect(autoMatched.find(Bolt).length).toEqual(1);
    expect(autoMatched.html()).toContain('This media was automatically matched to the cluster');
  });

  it('should return null for invalid type', () => {
    const wrapper = mountWithIntl(<MediaBanner media_cluster_relationship={media_cluster_relationship} media_cluster_origin_timestamp={media_cluster_origin_timestamp} media_cluster_origin={99} media_cluster_origin_user={media_cluster_origin_user} />);
    expect(wrapper.find('FormattedMessage').length).toEqual(0);
  });
});
