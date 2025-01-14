import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Person from '../../icons/person.svg';
import PersonAdd from '../../icons/person_add.svg';
import PersonCheck from '../../icons/person_check.svg';
import Bolt from '../../icons/bolt.svg';
import Tipline from '../../icons/question_answer.svg';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import CheckMediaOrigin from '../../CheckMediaOrigin';

const getIconAndMessage = (type, user) => {
  switch (type) {
  case CheckMediaOrigin.TIPLINE_SUBMITTED:
    return {
      icon: <Tipline />,
      message: (
        <FormattedMessage
          defaultMessage="Tipline Submitted"
          description="Message for Tipline Submitted"
          id="mediaOrigin.tiplineSubmitted"
        />
      ),
      tooltipMessage: (
        <FormattedMessage
          defaultMessage="Original cluster media submitted by Tipline User"
          description="Tooltip message for Tipline Submitted"
          id="mediaOrigin.tiplineSubmittedTooltip"
        />
      ),
    };
  case CheckMediaOrigin.USER_ADDED:
    return {
      icon: <PersonAdd />,
      message: (
        <FormattedMessage
          defaultMessage="User Added"
          description="This media was added by a user."
          id="mediaOrigin.userAdded"
        />
      ),
      tooltipMessage: (
        <FormattedHTMLMessage
          defaultMessage="<strong>{user}</strong> uploaded this media using the Check interface"
          description="Tooltip message for User Added"
          id="mediaOrigin.userAddedTooltip"
          values={{ user }}
        />
      ),
    };
  case CheckMediaOrigin.USER_MERGED:
    return {
      icon: <Person />,
      message: (
        <FormattedMessage
          defaultMessage="User Merged"
          description="Message for User Merged"
          id="mediaOrigin.userMerged"
        />
      ),
      tooltipMessage: (
        <FormattedHTMLMessage
          defaultMessage="<strong>{user}</strong> added this media by merging from another cluster"
          description="Tooltip message for User Merged"
          id="mediaOrigin.userMergedTooltip"
          values={{ user }}
        />
      ),
    };
  case CheckMediaOrigin.USER_MATCHED:
    return {
      icon: <PersonCheck />,
      message: (
        <FormattedMessage
          defaultMessage="User Matched"
          description="Message for User Matched"
          id="mediaOrigin.userMatched"
        />
      ),
      tooltipMessage: (
        <FormattedHTMLMessage
          defaultMessage="<strong>{user}</strong> accepted this media as a suggested match"
          description="Tooltip message for User Matched"
          id="mediaOrigin.userMatchedTooltip"
          values={{ user }}
        />
      ),
    };
  case CheckMediaOrigin.AUTO_MATCHED:
    return {
      icon: <Bolt />,
      message: (
        <FormattedMessage
          defaultMessage="Auto Matched"
          description="Message for Auto Matched"
          id="mediaOrigin.autoMatched"
        />
      ),
      tooltipMessage: (
        <FormattedMessage
          defaultMessage="Automatically matched media by Check"
          description="Tooltip message for Auto Matched"
          id="mediaOrigin.autoMatchedTooltip"
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

const MediaOrigin = ({ type, user }) => {
  const { icon, message, tooltipMessage } = getIconAndMessage(type, user);

  return (
    <Tooltip
      arrow
      title={tooltipMessage}
    >
      <span>
        <ButtonMain
          iconLeft={icon}
          label={message}
          size="small"
          theme="lightText"
          variant="text"
        />
      </span>
    </Tooltip>
  );
};

MediaOrigin.defaultProps = {
  user: 'Unknown User',
};

MediaOrigin.propTypes = {
  type: PropTypes.number.isRequired,
  user: PropTypes.string,
};

export default MediaOrigin;
