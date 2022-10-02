import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import ParsedText from '../ParsedText';
import BulletSeparator from '../layout/BulletSeparator';
import { separationGray } from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    borderBottom: `1px ${separationGray} solid`,
    padding: `${theme.spacing(3)}px ${theme.spacing(1)}px`,
  },
  name: {
    marginLeft: theme.spacing(1),
  },
}));

const RequestCard = ({
  icon,
  details,
  text,
  fileUrl,
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
        <ParsedText text={preParsedText} />
      </div>
    </div>
  );
};

RequestCard.propTypes = {
  details: PropTypes.array.isRequired,
  text: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  fileUrl: PropTypes.string,
};

RequestCard.defaultProps = {
  fileUrl: null,
};

export default RequestCard;
