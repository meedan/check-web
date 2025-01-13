import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Person from '../../icons/person.svg';
import PersonAdd from '../../icons/person_add.svg';
import PersonCheck from '../../icons/person_check.svg';
import Bolt from '../../icons/bolt.svg';
import Tipline from '../../icons/question_answer.svg';
import Alert from '../cds/alerts-and-prompts/Alert';
import CheckMediaOrigin from '../../CheckMediaOrigin';

const getIconAndMessage = (type, user, cluster, datetime) => {
  // The default messages are temporary, and will be updated in the ticket CV2-5785
  switch (type) {
  case CheckMediaOrigin.TIPLINE_SUBMITTED:
    return {
      icon: <Tipline />,
      message: (
        <FormattedHTMLMessage
          defaultMessage="This media was submitted via <strong>Tipline</strong> on {datetime}."
          description="Message for Tipline Submitted"
          id="MediaBanner.tiplineSubmitted"
          values={{ datetime }}
        />
      ),
    };
  case CheckMediaOrigin.USER_ADDED:
    return {
      icon: <PersonAdd />,
      message: (
        <FormattedHTMLMessage
          defaultMessage="This media was added to the cluster by <strong>{user}</strong> on {datetime}"
          description="Message for User Matched"
          id="MediaBanner.userAdded"
          values={{ user, datetime }}
        />
      ),
    };
  case CheckMediaOrigin.USER_MERGED:
    return {
      icon: <Person />,
      message: (
        <FormattedHTMLMessage
          defaultMessage="This media was added to the cluster by <strong>{user}</strong> when merged from {cluster} on {datetime}"
          description="Message for User Matched"
          id="MediaBanner.userMerged"
          values={{ user, cluster, datetime }}
        />
      ),
    };
  case CheckMediaOrigin.USER_MATCHED:
    return {
      icon: <PersonCheck />,
      message: (
        <FormattedHTMLMessage
          defaultMessage="This media was added to the cluster by <strong>{user}</strong> when accpeted from {cluster}, {datetime}"
          description="Message for User Matched"
          id="MediaBanner.userMatched"
          values={{ user, cluster, datetime }}
        />
      ),
    };
  case CheckMediaOrigin.AUTO_MATCHED:
    return {
      icon: <Bolt />,
      message: (
        <FormattedMessage
          defaultMessage="This media was automatically matched to the cluster."
          description="Message for Auto Matched"
          id="MediaBanner.autoMatched"
        />
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

const MediaBanner = ({
  cluster, datetime, type, user,
}) => {
  const { icon, message } = getIconAndMessage(type, user, cluster, datetime);

  return (
    <Alert
      content={<span style={{ color: 'black' }}>{message}</span>}
      customIcon={icon}
      icon
      variant="info"
    />
  );
};

MediaBanner.defaultProps = {
  user: 'Unknown User',
};

MediaBanner.propTypes = {
  cluster: PropTypes.string.isRequired,
  datetime: PropTypes.string.isRequired,
  type: PropTypes.number.isRequired,
  user: PropTypes.string,
};

export default MediaBanner;
