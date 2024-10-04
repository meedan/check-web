import React from 'react';
// import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import SlowMotionVideoIcon from '../../../icons/slow_motion_video.svg';
import styles from './MediaControls.module.css';

const MediaPlaybackSpeed = ({
  playbackSpeed,
  setPlaybackSpeed,
  videoRef,
}) => {
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
      <ButtonMain
        iconCenter={<SlowMotionVideoIcon />}
        size="default"
        theme="white"
        variant="text"
        onClick={handleClick}
      />
      <Menu
        anchorEl={anchorEl}
        container={containerRef.current}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem className={playbackSpeed === 0.25 ? styles.activePlaybackSpeed : ''} onClick={() => handlePlaybackRateChange(0.25)}>0.25x</MenuItem>
        <MenuItem className={playbackSpeed === 0.5 ? styles.activePlaybackSpeed : ''} onClick={() => handlePlaybackRateChange(0.5)}>0.5x</MenuItem>
        <MenuItem className={playbackSpeed === 0.75 ? styles.activePlaybackSpeed : ''} onClick={() => handlePlaybackRateChange(0.75)}>0.75x</MenuItem>
        <MenuItem className={playbackSpeed === 1 ? styles.activePlaybackSpeed : ''} onClick={() => handlePlaybackRateChange(1)}>
          <FormattedMessage defaultMessage="Normal speed" description="Sets video playback rate to original 1x speed" id="media.normalSpeed" />
        </MenuItem>
        <MenuItem className={playbackSpeed === 1.25 ? styles.activePlaybackSpeed : ''} onClick={() => handlePlaybackRateChange(1.25)}>1.25x</MenuItem>
        <MenuItem className={playbackSpeed === 1.5 ? styles.activePlaybackSpeed : ''} onClick={() => handlePlaybackRateChange(1.5)}>1.5x</MenuItem>
        <MenuItem className={playbackSpeed === 1.75 ? styles.activePlaybackSpeed : ''} onClick={() => handlePlaybackRateChange(1.75)}>1.75x</MenuItem>
        <MenuItem className={playbackSpeed === 2 ? styles.activePlaybackSpeed : ''} onClick={() => handlePlaybackRateChange(2)}>2x</MenuItem>
      </Menu>
    </div>
  );
};

MediaPlaybackSpeed.propTypes = {
};

MediaPlaybackSpeed.defaultProps = {
};

export default MediaPlaybackSpeed;
