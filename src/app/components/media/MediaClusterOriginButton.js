import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import Person from '../../icons/person.svg';
import PersonAdd from '../../icons/person_add.svg';
import PersonCheck from '../../icons/person_check.svg';
import Bolt from '../../icons/bolt.svg';
import Tipline from '../../icons/question_answer.svg';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';

const allowedTypes = new Set(['typeA', 'typeB', 'typeC', 'typeD', 'typeE']);

const getIconAndMessage = (type) => {
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
        <FormattedMessage
          defaultMessage="This media was merged by a user."
          description="Tooltip message for User Merged"
          id="mediaClusterOriginButton.userMergedTooltip"
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
        <FormattedMessage
          defaultMessage="This media was matched by a user."
          description="Tooltip message for User Matched"
          id="mediaClusterOriginButton.userMatchedTooltip"
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
        <FormattedMessage
          defaultMessage="This media was added by a user."
          description="Tooltip message for User Added"
          id="mediaClusterOriginButton.userAddedTooltip"
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
          defaultMessage="This media was submitted via Tipline."
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
          defaultMessage="This media was auto-matched."
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

const MediaClusterOriginButton = ({ type }) => {
  if (!allowedTypes.has(type)) {
    // eslint-disable-next-line
    console.log('Invalid type:', type);
    return null;
  }

  const { icon, message, tooltipMessage } = getIconAndMessage(type);

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

MediaClusterOriginButton.propTypes = {
  type: PropTypes.string.isRequired,
};

export default MediaClusterOriginButton;
