import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import ParsedText from '../../ParsedText';
import BulletSeparator from '../../layout/BulletSeparator';
import { grayBorderMain } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    borderBottom: `1px ${grayBorderMain} solid`,
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
  fileUrl,
  mediaTitle,
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
      <div>
        <ParsedText text={preParsedText} fileUrlName={mediaTitle} />
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
};

Request.defaultProps = {
  fileUrl: null,
  mediaTitle: null,
};

export default Request;
