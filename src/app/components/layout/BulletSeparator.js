import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import {
  black54,
} from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  dot: {
    width: '8px',
    height: '8px',
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
  },
  details: {
    display: 'flex',
    alignItems: 'center',
    color: black54,
  },
  icon: {
    marginRight: theme.spacing(1),
  },
}));

const BulletSeparator = ({
  icon,
  details,
}) => {
  const classes = useStyles();
  const subtitleDetails = details.map((d, index) => (
    <span key={`${d}-${Math.random()}`}>
      { index > 0 ? <FiberManualRecordIcon className={classes.dot} /> : null }
      {d}
    </span>
  ));

  return (
    <div>
      <Box display="flex" alignItems="center" my={0.5}>
        { icon ? <div className={classes.icon}>{icon}</div> : null }
        <div className={classes.details}>{subtitleDetails}</div>
      </Box>
    </div>
  );
};

BulletSeparator.propTypes = {
  details: PropTypes.array.isRequired,
  icon: PropTypes.node,
};

BulletSeparator.defaultProps = {
  icon: null,
};

export default BulletSeparator;
