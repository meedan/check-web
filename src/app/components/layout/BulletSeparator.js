import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import FiberManualRecordIcon from '@material-ui/icons/FiberManualRecord';

const useStyles = makeStyles(theme => ({
  dot: {
    width: '8px',
    height: '8px',
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  details: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    color: 'var(--textSecondary)',
    lineHeight: '20px',
  },
  detailSpan: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    height: '24px',
    marginRight: theme.spacing(1),
  },
}));

const BulletSeparator = ({
  icon,
  details,
  compact,
}) => {
  const classes = useStyles();
  const subtitleDetails = details.filter(d => !!d).map((d, index) => (
    <span key={`${d}-${Math.random()}`} className={classes.detailSpan}>
      { index > 0 ? <FiberManualRecordIcon className={classes.dot} /> : null }
      {d}
    </span>
  ));

  return (
    <Typography variant="body1" component="div">
      <Box display="flex" alignItems="center" mb={compact ? 0 : 2} className={classes.details}>
        { icon ? <div className={classes.icon}>{icon}</div> : null }
        {subtitleDetails}
      </Box>
    </Typography>
  );
};

BulletSeparator.propTypes = {
  details: PropTypes.array.isRequired,
  icon: PropTypes.node,
  compact: PropTypes.bool,
};

BulletSeparator.defaultProps = {
  icon: null,
  compact: false,
};

export default BulletSeparator;
