import React from 'react';
// import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import {
  Slider,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
  },
  track: {
    height: theme.spacing(2),
  },
}));

const CustomSlider = withStyles(theme => ({
  root: {
    padding: theme.spacing(1, 0, 2, 0),
    '&:hover': {
      '& $thumb': {
        opacity: 1,
      },
    },
  },
  thumb: {
    color: 'var(--color-white-100)',
    height: theme.spacing(1.5),
    width: theme.spacing(1.5),
    opacity: 0,
    '&:focus, &:hover, &$active': {
      boxShadow: 'inherit',
    },
  },
  focusVisible: {
    boxShadow: 'none',
  },
  track: {
    height: theme.spacing(0.5),
    borderRadius: theme.spacing(0.5),
    color: 'var(--color-white-100)',
  },
  rail: {
    height: theme.spacing(0.5),
    borderRadius: theme.spacing(0.5),
    color: 'rgba(255, 255, 255, 0.7)',
  },
}))(Slider);

const MediaTimeline = ({
  currentTime,
  duration,
  setCurrentTime,
  videoRef,
}) => {
  const classes = useStyles();

  const handleChange = (event, newValue) => {
    setCurrentTime(newValue);
  };

  const handleCommit = (event, newValue) => {
    const video = videoRef.current;
    video.currentTime = newValue;
  };

  return (
    <CustomSlider
      className={classes.root}
      max={duration}
      step={duration / 1000}
      value={currentTime}
      onChange={handleChange}
      onChangeCommitted={handleCommit}
    />
  );
};

MediaTimeline.propTypes = {
};

MediaTimeline.defaultProps = {
};

export default MediaTimeline;
