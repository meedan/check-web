import React from 'react';
// import PropTypes from 'prop-types';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import {
  Box,
  IconButton,
  Slider,
} from '@material-ui/core';
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeOffIcon from '@material-ui/icons/VolumeOff';
import { otherWhite, overlayLight } from '../../../styles/js/shared';

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
      backgroundColor: overlayLight,
    },
  },
  slider: {
    flex: 1,
    marginRight: theme.spacing(1.5),
    opacity: 0,
  },
  icon: {
    color: otherWhite,
    '&:hover': {
      color: otherWhite,
      backgroundColor: overlayLight,
    },
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
    color: otherWhite,
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
    color: otherWhite,
  },
  rail: {
    height: theme.spacing(0.5),
    borderRadius: theme.spacing(0.5),
    color: 'rgba(255, 255, 255, 0.7)',
  },
}))(Slider);

const MediaVolume = ({
  volume,
  setVolume,
  videoRef,
}) => {
  const classes = useStyles();
  const [isVolumeOff, setIsVolumeOff] = React.useState(false);
  const [oldVolume, setOldVolume] = React.useState(0);

  const handleChange = (event, newValue) => {
    setVolume(newValue);
    const video = videoRef.current;
    video.volume = newValue;
    if (newValue === 0) {
      setIsVolumeOff(true);
    } else {
      setIsVolumeOff(false);
    }
  };

  const handleMute = () => {
    const video = videoRef.current;
    // if volume is NOT currently off, so we are turning it off
    if (!isVolumeOff) {
      setOldVolume(video.volume);
      setVolume(0);
      video.volume = 0;
    } else {
      setVolume(oldVolume);
      video.volume = oldVolume;
    }
    setIsVolumeOff(!isVolumeOff);
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
      <IconButton className={classes.icon} onClick={handleMute} size="small">
        { isVolumeOff ? <VolumeOffIcon /> : <VolumeUpIcon /> }
      </IconButton>
    </Box>
  );
};

MediaVolume.propTypes = {
};

MediaVolume.defaultProps = {
};

export default MediaVolume;
