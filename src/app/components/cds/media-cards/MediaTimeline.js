import React from 'react';
// import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import {
  Slider,
} from '@material-ui/core';
// import { brandBorder, grayBorderAccent, otherWhite, textPrimary } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
  },
  track: {
    height: theme.spacing(2),
  },
}));

const CustomSlider = withStyles(theme => ({
  root: {
    '&:hover': {
      '& $thumb': {
        opacity: 1,
      },
    },
  },
  thumb: {
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
  },
  rail: {
    height: theme.spacing(0.5),
    borderRadius: theme.spacing(0.5),
  },
}))(Slider);

const MediaTimeline = ({
  currentTime,
  setCurrentTime,
  duration,
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
      value={currentTime}
      step={duration / 1000}
      max={duration}
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
