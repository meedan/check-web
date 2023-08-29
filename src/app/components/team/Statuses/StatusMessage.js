import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import CommentIcon from '../../../icons/chat_bubble.svg';
import styles from './Statuses.module.css';

const StatusMessage = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className={cx(styles['status-message'], 'test__status-message')}>
      <Tooltip
        arrow
        title={<FormattedMessage id="statusListItem.messageTooltip" defaultMessage="This message will be sent to the user who requested the item when you change an item to this status" description="Tooltip to tell the user when this message will be sent out" />}
      >
        <span>
          <CommentIcon />
        </span>
      </Tooltip>
      <p>
        {message}
      </p>
    </div>
  );
};

StatusMessage.defaultProps = {
  message: null,
};

StatusMessage.propTypes = {
  message: PropTypes.string,
};

export default StatusMessage;
