import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import Alert from '../../cds/alerts-and-prompts/Alert';
import styles from './Statuses.module.css';

const StatusMessage = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <Alert
      className={cx(styles['status-message'], 'test__status-message')}
      variant="info"
      icon
      title={<FormattedMessage id="statusListItem.messageTooltip" defaultMessage="When you change and item to this status, the user who requested will receive the following message:" description="Tooltip to tell the user when this message will be sent out" />}
      content={message}
    />
  );
};

StatusMessage.defaultProps = {
  message: null,
};

StatusMessage.propTypes = {
  message: PropTypes.object,
};

export default StatusMessage;
