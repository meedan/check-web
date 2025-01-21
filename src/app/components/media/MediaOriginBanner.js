import React from 'react';
import PropTypes from 'prop-types';
import { FormattedHTMLMessage } from 'react-intl';
import Person from '../../icons/person.svg';
import PersonAdd from '../../icons/person_add.svg';
import PersonCheck from '../../icons/person_check.svg';
import Bolt from '../../icons/bolt.svg';
import Tipline from '../../icons/question_answer.svg';
import Alert from '../cds/alerts-and-prompts/Alert';
import CheckMediaOrigin from '../../CheckMediaOrigin';
import { parseStringUnixTimestamp } from '../../helpers';
import TimeBefore from '../TimeBefore';

const getIconAndMessage = (media_cluster_origin, media_cluster_relationship, media_cluster_origin_user, media_cluster_origin_timestamp) => {
  // The default messages are temporary, and will be updated in the ticket CV2-5785
  const formattedTimestamp = <TimeBefore date={parseStringUnixTimestamp(media_cluster_origin_timestamp)} />;
  const media_cluster_origin_confirmed_by = media_cluster_relationship?.confirmed_by?.name;
  const media_cluster_origin_title = media_cluster_relationship?.target?.title;

  switch (media_cluster_origin) {
  case CheckMediaOrigin.TIPLINE_SUBMITTED:
    return {
      icon: <Tipline />,
      message: (
        <>
          <FormattedHTMLMessage
            defaultMessage="This media was submitted via <strong>Tipline</strong>, "
            description="Message for Tipline Submitted"
            id="mediaOriginBanner.tiplineSubmitted"
          />
          {formattedTimestamp}
        </>
      ),
    };
  case CheckMediaOrigin.USER_ADDED:
    return {
      icon: <PersonAdd />,
      message: (
        <>
          <FormattedHTMLMessage
            defaultMessage="This media was added to the cluster by <strong>{media_cluster_origin_user}</strong>, "
            description="Message for User Added"
            id="mediaOriginBanner.userAdded"
            values={{ media_cluster_origin_user }}
          />
          {formattedTimestamp}
        </>
      ),
    };
  case CheckMediaOrigin.USER_MERGED:
    return {
      icon: <Person />,
      message: (
        <>
          <FormattedHTMLMessage
            defaultMessage="This media was merged to the cluster by <strong>{media_cluster_origin_user}</strong>, "
            description="Message for User Merged"
            id="mediaOriginBanner.userMerged"
            values={{ media_cluster_origin_user }}
          />
          {formattedTimestamp}
        </>
      ),
    };
  case CheckMediaOrigin.USER_MATCHED:
    return {
      icon: <PersonCheck />,
      message: (
        <>
          <FormattedHTMLMessage
            defaultMessage="This media was added to the cluster by <strong>{media_cluster_origin_confirmed_by}</strong> when accepted from <strong><u>{media_cluster_origin_title}</u></strong>, "
            description="Message for User Matched"
            id="mediaOriginBanner.userMatched"
            values={{ media_cluster_origin_confirmed_by, media_cluster_origin_title }}
          />
          {formattedTimestamp}
        </>
      ),
    };
  case CheckMediaOrigin.AUTO_MATCHED:
    return {
      icon: <Bolt />,
      message: (
        <>
          <FormattedHTMLMessage
            defaultMessage="This media was automatically matched to the cluster, "
            description="Message for Auto Matched"
            id="mediaOriginBanner.autoMatched"
          />
          {formattedTimestamp}
        </>
      ),
    };
  default:
    return {
      icon: null,
      message: null,
      tooltipMessage: null,
    };
  }
};

const MediaOriginBanner = ({
  media_cluster_origin, media_cluster_origin_timestamp, media_cluster_origin_user, media_cluster_relationship,
}) => {
  const { icon, message } = getIconAndMessage(media_cluster_origin, media_cluster_relationship, media_cluster_origin_user, media_cluster_origin_timestamp);

  return (
    <Alert
      content={<span style={{ color: 'black' }}>{message}</span>}
      customIcon={icon}
      icon
      variant="info"
    />
  );
};

MediaOriginBanner.propTypes = {
  media_cluster_origin: PropTypes.number.isRequired,
  media_cluster_origin_timestamp: PropTypes.number.isRequired,
  media_cluster_origin_user: PropTypes.string.isRequired,
  media_cluster_relationship: PropTypes.shape({
    confirmed_by: PropTypes.shape({
      name: PropTypes.string,
    }),
    target: PropTypes.shape({
      title: PropTypes.string,
    }),
  }).isRequired,
};

export default MediaOriginBanner;
