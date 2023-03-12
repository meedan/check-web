import React from 'react';
// import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import {
  Box,
  Slider,
} from '@material-ui/core';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
// import { brandBorder, grayBorderAccent, otherWhite, textPrimary } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  container: {
    borderRadius: theme.spacing(4.5),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    alignItems: 'center',
    maxWidth: '150px',
    width: '150px',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    transition: '0.5s',
    '&:hover': {
      '& $slider': {
        opacity: 1,
        transition: '0.5s',
      },
      backgroundColor: 'yellow',
    },
  },
  slider: {
    flex: 1,
    marginRight: theme.spacing(1.5),
    opacity: 0,
  },
  icon: {
    flex: '0 0 24px',
    marginRight: theme.spacing(-1),
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
    boxShadow: 'none',
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

const MediaVolume = ({
  volume,
  setVolume,
  videoRef,
}) => {
  const classes = useStyles();

  const handleChange = (event, newValue) => {
    setVolume(newValue);
    const video = videoRef.current;
    video.volume = newValue;
  };

  return (
    <Box display="flex" className={classes.container}>
      <CustomSlider
        className={classes.slider}
        value={volume}
        step={0.01}
        min={0}
        max={1}
        onChange={handleChange}
      />
      <VolumeUpIcon className={classes.icon} />
    </Box>
  );
};

MediaVolume.propTypes = {
};

MediaVolume.defaultProps = {
};

export default MediaVolume;
