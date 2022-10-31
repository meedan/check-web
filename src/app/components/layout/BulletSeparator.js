import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';
import { textSecondary } from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  dot: {
    width: '8px',
    height: '8px',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  details: {
    display: 'flex',
    alignItems: 'center',
    color: textSecondary,
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
  const subtitleDetails = details.filter(d => !!d).map((d, index) => (
    <Box display="flex" alignItems="center" key={`${d}-${Math.random()}`}>
      { index > 0 ? <FiberManualRecordIcon className={classes.dot} /> : null }
      {d}
    </Box>
  ));

  return (
    <div>
      <Box display="flex" alignItems="center">
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
