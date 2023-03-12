import React from 'react';
// import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import {
  IconButton,
  Menu,
  MenuItem,
} from '@material-ui/core';
import SlowMotionVideoIcon from '@material-ui/icons/SlowMotionVideo';
// import { brandBorder, grayBorderAccent, otherWhite, textPrimary } from '../../../styles/js/shared';

const useStyles = makeStyles(() => ({
  active: {
    backgroundColor: 'red',
  },
}));

const MediaPlaybackSpeed = ({
  playbackSpeed,
  setPlaybackSpeed,
  videoRef,
}) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePlaybackRateChange = (newValue) => {
    setPlaybackSpeed(newValue);
    const video = videoRef.current;
    video.playbackRate = newValue;
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton onClick={handleClick}>
        <SlowMotionVideoIcon className={classes.icon} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem className={playbackSpeed === 0.25 ? classes.active : ''} onClick={() => handlePlaybackRateChange(0.25)}>0.25x</MenuItem>
        <MenuItem className={playbackSpeed === 0.5 ? classes.active : ''} onClick={() => handlePlaybackRateChange(0.5)}>0.5x</MenuItem>
        <MenuItem className={playbackSpeed === 0.75 ? classes.active : ''} onClick={() => handlePlaybackRateChange(0.75)}>0.75x</MenuItem>
        <MenuItem className={playbackSpeed === 1 ? classes.active : ''} onClick={() => handlePlaybackRateChange(1)}>
          <FormattedMessage id="media.normalSpeed" defaultMessage="Normal speed" description="Sets video playback rate to original 1x speed" />
        </MenuItem>
        <MenuItem className={playbackSpeed === 1.25 ? classes.active : ''} onClick={() => handlePlaybackRateChange(1.25)}>1.25x</MenuItem>
        <MenuItem className={playbackSpeed === 1.5 ? classes.active : ''} onClick={() => handlePlaybackRateChange(1.5)}>1.5x</MenuItem>
        <MenuItem className={playbackSpeed === 1.75 ? classes.active : ''} onClick={() => handlePlaybackRateChange(1.75)}>1.75x</MenuItem>
        <MenuItem className={playbackSpeed === 2 ? classes.active : ''} onClick={() => handlePlaybackRateChange(2)}>2x</MenuItem>
      </Menu>
    </>
  );
};

MediaPlaybackSpeed.propTypes = {
};

MediaPlaybackSpeed.defaultProps = {
};

export default MediaPlaybackSpeed;
