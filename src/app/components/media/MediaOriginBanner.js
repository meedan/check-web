import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
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
import dialogStyles from '../../styles/css/dialog.module.css';

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

const MediaOriginBanner = ({ projectMedia }) => {
  const {
    media_cluster_origin: origin,
    media_cluster_origin_timestamp: originTimestamp,
    media_cluster_origin_user: user,
    media_cluster_relationship: mediaClusterRelationship,
  } = projectMedia;

  // We check for `origin == null` (instead of `!origin`) because TIPLINE_SUBMITTED is 0,
  // which would evaluate as falsy in a `!origin` check. Using `== null` ensures we only
  // fallback when `origin` is `null` , not when it's `0`.
  if (origin == null) {
    return null;
  }

  const { icon, message } = getIconAndMessage(origin, mediaClusterRelationship, user?.name, originTimestamp);
  return (
    <Alert
      className={dialogStyles['dialog-alert']}
      content={message}
      customIcon={icon}
      icon
      variant="info"
    />
  );
};

MediaOriginBanner.defaultProps = {
  projectMedia: PropTypes.object.isRequired,
};

// eslint-disable-next-line import/no-unused-modules
export { MediaOriginBanner }; // Used in unit test

export default createFragmentContainer(MediaOriginBanner, graphql`
  fragment MediaOriginBanner_projectMedia on ProjectMedia {
    media_cluster_origin
    media_cluster_origin_user {
      name
    }
    media_cluster_origin_timestamp
    media_cluster_relationship {
      target{
        title
      }
      confirmed_by {
        name
      }
    }
  }
`);
