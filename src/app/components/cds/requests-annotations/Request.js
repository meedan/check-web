/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import ParsedText from '../../ParsedText';
import BulletSeparator from '../../layout/BulletSeparator';
import styles from './Request.module.css';

const Request = ({
  details,
  fileUrl,
  historyButton,
  icon,
  mediaTitle,
  receipt,
  sendMessageButton,
  text,
  time,
}) => {
  let preParsedText = text;
  preParsedText = preParsedText.replace(/^null /, '').replace(/^undefined /, ''); // Clean-up bad Feed API requests
  if (fileUrl && fileUrl !== '') {
    preParsedText = preParsedText.replace(/https?:\/\/[^ ]+/, fileUrl); // Replace external media URL by internal media URL
  }

  return (
    <div className={cx('request-card', styles['request-card'])}>
      <div className={styles['request-card-header']}>
        <BulletSeparator compact details={details} icon={icon} />
        {time}
      </div>
      <div className={styles['request-content']}>
        <ParsedText fileUrlName={mediaTitle} mediaChips text={preParsedText} />
      </div>
      <div className={styles['request-card-footer']}>
        <div className={styles['request-card-actions']}>
          {historyButton}
          {sendMessageButton}
        </div>
        {receipt}
      </div>
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
