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

const getIconAndMessage = (origin, mediaClusterRelationship, user, originTimestamp) => {
  const formattedTimestamp = <TimeBefore date={parseStringUnixTimestamp(originTimestamp)} />;
  const confirmedBy = mediaClusterRelationship?.confirmed_by?.name;
  const originTitle = mediaClusterRelationship?.target?.title;

  switch (origin) {
  case CheckMediaOrigin.TIPLINE_SUBMITTED:
    return {
      icon: <Tipline />,
      message: (
        <>
          <FormattedHTMLMessage
            defaultMessage="This media was submitted via <strong>Tipline</strong>"
            description="Message for Tipline Submitted"
            id="mediaOriginBanner.tiplineSubmitted"
          />
          {', '}
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
            defaultMessage="This media was added to the cluster of media by <strong>{user}</strong>"
            description="Message for User Added"
            id="mediaOriginBanner.userAdded"
            values={{ user }}
          />
          {', '}
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
            defaultMessage="This media was merged into this cluster of media by <strong>{user}</strong>"
            description="Message for User Merged"
            id="mediaOriginBanner.userMerged"
            values={{ user }}
          />
          {', '}
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
            defaultMessage="This media was added to the cluster of media by <strong>{confirmedBy}</strong> when accepted from <strong><u>{originTitle}</u></strong>"
            description="Message for User Matched"
            id="mediaOriginBanner.userMatched"
            values={{ confirmedBy, originTitle }}
          />
          {', '}
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
            defaultMessage="This media was automatically matched to the cluster of media"
            description="Message for Auto Matched"
            id="mediaOriginBanner.autoMatched"
          />
          {', '}
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
  mediaClusterRelationship, origin, originTimestamp, user,
}) => {
  const { icon, message } = getIconAndMessage(origin, mediaClusterRelationship, user, originTimestamp);
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
  mediaClusterRelationship: PropTypes.shape({
    confirmedBy: PropTypes.shape({
      name: PropTypes.string,
    }),
    target: PropTypes.shape({
      title: PropTypes.string.isRequired,
    }),
  }),
  origin: PropTypes.number.isRequired,
  originTimestamp: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
  user: PropTypes.string.isRequired,
};

export default MediaOriginBanner;
