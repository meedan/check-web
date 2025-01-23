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

const getIconAndMessage = (mediaClusterOrigin, mediaClusterRelationship, mediaClusterOriginUser, mediaClusterOriginTimestamp) => {
  const formattedTimestamp = <TimeBefore date={parseStringUnixTimestamp(mediaClusterOriginTimestamp)} />;
  const mediaClusterOriginConfirmedBy = mediaClusterRelationship?.confirmed_by?.name;
  const mediaClusterOriginTitle = mediaClusterRelationship?.target?.title;

  switch (mediaClusterOrigin) {
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
            defaultMessage="This media was added to the cluster of media by <strong>{mediaClusterOriginUser}</strong>, "
            description="Message for User Added"
            id="mediaOriginBanner.userAdded"
            values={{ mediaClusterOriginUser }}
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
            defaultMessage="This media was merged into this cluster of media by <strong>{mediaClusterOriginUser}</strong>, "
            description="Message for User Merged"
            id="mediaOriginBanner.userMerged"
            values={{ mediaClusterOriginUser }}
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
            defaultMessage="This media was added to the cluster of media by <strong>{mediaClusterOriginConfirmedBy}</strong> when accepted from <strong><u>{mediaClusterOriginTitle}</u></strong>, "
            description="Message for User Matched"
            id="mediaOriginBanner.userMatched"
            values={{ mediaClusterOriginConfirmedBy, mediaClusterOriginTitle }}
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
            defaultMessage="This media was automatically matched to the cluster of media, "
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
  mediaClusterOrigin, mediaClusterOriginTimestamp, mediaClusterOriginUser, mediaClusterRelationship,
}) => {
  const { icon, message } = getIconAndMessage(mediaClusterOrigin, mediaClusterRelationship, mediaClusterOriginUser, mediaClusterOriginTimestamp);
  return (
    <div style={{ marginBottom: '8px' }}>
      <Alert
        content={<span style={{ color: 'black' }}>{message}</span>}
        customIcon={icon}
        icon
        variant="info"
      />
    </div>
  );
};

MediaOriginBanner.defaultProps = {
  mediaClusterRelationship: {},
};

MediaOriginBanner.propTypes = {
  mediaClusterOrigin: PropTypes.number.isRequired,
  mediaClusterOriginTimestamp: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  mediaClusterOriginUser: PropTypes.string.isRequired,
  mediaClusterRelationship: PropTypes.shape({
    confirmedBy: PropTypes.shape({
      name: PropTypes.string,
    }),
    target: PropTypes.shape({
      title: PropTypes.string,
    }),
  }),
};

export default MediaOriginBanner;
