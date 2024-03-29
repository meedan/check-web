import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import styles from './Request.module.css';
import ParsedText from '../../ParsedText';
import BulletSeparator from '../../layout/BulletSeparator';

const Request = ({
  icon,
  details,
  text,
  time,
  fileUrl,
  mediaTitle,
  sendMessageButton,
  historyButton,
  receipt,
}) => {
  let preParsedText = text;
  preParsedText = preParsedText.replace(/^null /, '').replace(/^undefined /, ''); // Clean-up bad Feed API requests
  if (fileUrl && fileUrl !== '') {
    preParsedText = preParsedText.replace(/https?:\/\/[^ ]+/, fileUrl); // Replace external media URL by internal media URL
  }

  return (
    <div className={cx('request-card', styles['request-card'])}>
      <BulletSeparator compact icon={icon} details={details} />
      <div className={cx(styles['request-time'])}>{time}</div>
      <div className={styles['request-content']}>
        <ParsedText text={preParsedText} fileUrlName={mediaTitle} mediaChips />
      </div>
      <div className={styles.buttons}>
        {historyButton}
        {sendMessageButton}
      </div>
      {receipt}
    </div>
  );
};

Request.propTypes = {
  details: PropTypes.array.isRequired,
  text: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  fileUrl: PropTypes.string,
  mediaTitle: PropTypes.string,
  historyButton: PropTypes.element,
  sendMessageButton: PropTypes.element,
  receipt: PropTypes.element,
};

Request.defaultProps = {
  fileUrl: null,
  mediaTitle: null,
  historyButton: null,
  sendMessageButton: null,
  receipt: null,
};

export default Request;
