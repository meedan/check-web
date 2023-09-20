import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import styles from './Request.module.css';
import ParsedText from '../../ParsedText';
import BulletSeparator from '../../layout/BulletSeparator';

const useStyles = makeStyles(theme => ({
  root: {
    borderBottom: '1px var(--grayBorderMain) solid',
    padding: `${theme.spacing(3)}px ${theme.spacing(1)}px`,
  },
  name: {
    marginLeft: theme.spacing(1),
  },
}));

const Request = ({
  icon,
  details,
  text,
  time,
  fileUrl,
  mediaTitle,
  receipt,
}) => {
  const classes = useStyles();

  let preParsedText = text;
  preParsedText = preParsedText.replace(/^null /, '').replace(/^undefined /, ''); // Clean-up bad Feed API requests
  if (fileUrl && fileUrl !== '') {
    preParsedText = preParsedText.replace(/https?:\/\/[^ ]+/, fileUrl); // Replace external media URL by internal media URL
  }

  return (
    <div className={[classes.root, 'request-card'].join(' ')}>
      <BulletSeparator icon={icon} details={details} />
      {time}
      <div className={styles['request-content']}>
        <ParsedText text={preParsedText} fileUrlName={mediaTitle} />
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
};

Request.defaultProps = {
  fileUrl: null,
  mediaTitle: null,
};

export default Request;
