import React from 'react';
// import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import {
  IconButton,
  Menu,
  MenuItem,
} from '@material-ui/core';
import SlowMotionVideoIcon from '../../../icons/slow_motion_video.svg';

const useStyles = makeStyles(() => ({
  active: {
    backgroundColor: 'var(--color-beige-93)',
  },
  icon: {
    color: 'var(--color-white-100)',
    fontSize: '24px',
    '&:hover': {
      color: 'var(--color-white-100)',
      backgroundColor: 'var(--overlayLight)',
    },
  },
}));

const MediaPlaybackSpeed = ({
  playbackSpeed,
  setPlaybackSpeed,
  videoRef,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const containerRef = React.useRef(null);

  const handlePlaybackRateChange = (newValue) => {
    setPlaybackSpeed(newValue);
    const video = videoRef.current;
    video.playbackRate = newValue;
    setAnchorEl(null);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div id="media-playback-speed" ref={containerRef}>
      <IconButton className={classes.icon} size="small" onClick={handleClick}>
        <SlowMotionVideoIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        container={containerRef.current}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem className={playbackSpeed === 0.25 ? classes.active : ''} onClick={() => handlePlaybackRateChange(0.25)}>0.25x</MenuItem>
        <MenuItem className={playbackSpeed === 0.5 ? classes.active : ''} onClick={() => handlePlaybackRateChange(0.5)}>0.5x</MenuItem>
        <MenuItem className={playbackSpeed === 0.75 ? classes.active : ''} onClick={() => handlePlaybackRateChange(0.75)}>0.75x</MenuItem>
        <MenuItem className={playbackSpeed === 1 ? classes.active : ''} onClick={() => handlePlaybackRateChange(1)}>
          <FormattedMessage defaultMessage="Normal speed" description="Sets video playback rate to original 1x speed" id="media.normalSpeed" />
        </MenuItem>
        <MenuItem className={playbackSpeed === 1.25 ? classes.active : ''} onClick={() => handlePlaybackRateChange(1.25)}>1.25x</MenuItem>
        <MenuItem className={playbackSpeed === 1.5 ? classes.active : ''} onClick={() => handlePlaybackRateChange(1.5)}>1.5x</MenuItem>
        <MenuItem className={playbackSpeed === 1.75 ? classes.active : ''} onClick={() => handlePlaybackRateChange(1.75)}>1.75x</MenuItem>
        <MenuItem className={playbackSpeed === 2 ? classes.active : ''} onClick={() => handlePlaybackRateChange(2)}>2x</MenuItem>
      </Menu>
    </div>
  );
};

MediaPlaybackSpeed.propTypes = {
};

MediaPlaybackSpeed.defaultProps = {
};

export default MediaPlaybackSpeed;
