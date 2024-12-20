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

const allowedTypes = new Set(['typeA', 'typeB', 'typeC', 'typeD', 'typeE']);

const getIconAndMessage = (type, user) => {
  switch (type) {
  case 'typeA':
    return {
      icon: <Person />,
      message: (
        <FormattedMessage
          defaultMessage="User Merged"
          description="Message for User Merged"
          id="mediaClusterOriginButton.userMerged"
        />
      ),
      tooltipMessage: (
        <FormattedHTMLMessage
          defaultMessage="<strong>{user}</strong> added this media by merging from another cluster"
          description="Tooltip message for User Merged"
          id="mediaClusterOriginButton.userMergedTooltip"
          values={{ user }}
        />
      ),
    };
  case 'typeB':
    return {
      icon: <PersonCheck />,
      message: (
        <FormattedMessage
          defaultMessage="User Matched"
          description="Message for User Matched"
          id="mediaClusterOriginButton.userMatched"
        />
      ),
      tooltipMessage: (
        <FormattedHTMLMessage
          defaultMessage="<strong>{user}</strong> accepted this media as a suggested match"
          description="Tooltip message for User Matched"
          id="mediaClusterOriginButton.userMatchedTooltip"
          values={{ user }}
        />
      ),
    };
  case 'typeC':
    return {
      icon: <PersonAdd />,
      message: (
        <FormattedMessage
          defaultMessage="User Added"
          description="This media was added by a user."
          id="mediaClusterOriginButton.userAdded"
        />
      ),
      tooltipMessage: (
        <FormattedHTMLMessage
          defaultMessage="<strong>{user}</strong> uploaded this media using the Check interface"
          description="Tooltip message for User Added"
          id="mediaClusterOriginButton.userAddedTooltip"
          values={{ user }}
        />
      ),
    };
  case 'typeD':
    return {
      icon: <Tipline />,
      message: (
        <FormattedMessage
          defaultMessage="Tipline Submitted"
          description="Message for Tipline Submitted"
          id="mediaClusterOriginButton.tiplineSubmitted"
        />
      ),
      tooltipMessage: (
        <FormattedMessage
          defaultMessage="Original cluster media submitted by Tipline User"
          description="Tooltip message for Tipline Submitted"
          id="mediaClusterOriginButton.tiplineSubmittedTooltip"
        />
      ),
    };
  case 'typeE':
    return {
      icon: <Bolt />,
      message: (
        <FormattedMessage
          defaultMessage="Auto Matched"
          description="Message for Auto Matched"
          id="mediaClusterOriginButton.autoMatched"
        />
      ),
      tooltipMessage: (
        <FormattedMessage
          defaultMessage="Automatically matched media by Check"
          description="Tooltip message for Auto Matched"
          id="mediaClusterOriginButton.autoMatchedTooltip"
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

const MediaClusterOriginButton = ({ type, user }) => {
  if (!allowedTypes.has(type)) {
    return null;
  }

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

MediaClusterOriginButton.defaultProps = {
  user: 'Unknown User',
};

MediaClusterOriginButton.propTypes = {
  type: PropTypes.string.isRequired,
  user: PropTypes.string,
};

export default MediaClusterOriginButton;
