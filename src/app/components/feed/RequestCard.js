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
}) => {
  const classes = useStyles();

  return (
    <div className={[classes.root, 'request-card'].join(' ')}>
      <BulletSeparator icon={icon} details={details} />
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

RequestCard.defaultProps = {

};

export default RequestCard;
