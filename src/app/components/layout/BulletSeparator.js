import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@material-ui/core';
import cx from 'classnames/bind';
import { makeStyles } from '@material-ui/core/styles';
import EllipseIcon from '../../icons/ellipse.svg';

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
    fontSize: '24px',
    marginRight: theme.spacing(1),
  },
}));

const BulletSeparator = ({
  icon,
  details,
  compact,
  className,
}) => {
  const classes = useStyles();
  const subtitleDetails = details.filter(d => !!d).map((d, index) => (
    <span key={`${d}-${Math.random()}`} className={classes.detailSpan}>
      { index > 0 ? <EllipseIcon className={classes.dot} /> : null }
      {d}
    </span>
  ));

  return (
    <div className={cx('typography-body1', className)}>
      <Box display="flex" alignItems="center" mb={compact ? 0 : 2} className={classes.details}>
        { icon ? <div className={classes.icon}>{icon}</div> : null }
        {subtitleDetails}
      </Box>
    </div>
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
