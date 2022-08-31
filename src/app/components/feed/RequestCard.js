import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import ParsedText from '../ParsedText';
import {
  black54,
  separationGray,
} from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    borderBottom: `1px ${separationGray} solid`,
    padding: `${theme.spacing(4)}px ${theme.spacing(1)}px`,
  },
  name: {
    marginLeft: theme.spacing(1),
  },
  details: {
    color: black54,
    marginBottom: theme.spacing(2),
  },
}));

const RequestCard = ({
  details,
  text,
}) => {
  const classes = useStyles();
  const subtitleDetails = details.map((d, index) => (
    <span key={d}>
      { index > 0 ? ' • ' : null }
      {d}
    </span>
  ));

  return (
    <div className={[classes.root, 'request-card'].join(' ')}>
      <div className={classes.details}>{ subtitleDetails }</div>
      <div>
        <ParsedText text={text} />
      </div>
    </div>
  );
};

RequestCard.propTypes = {
  details: PropTypes.array.isRequired,
  text: PropTypes.string.isRequired,
};

export default RequestCard;
