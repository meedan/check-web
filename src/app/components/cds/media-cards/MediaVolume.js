import React from 'react';
// import PropTypes from 'prop-types';
import Slider from '@material-ui/core/Slider';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import VolumeUpIcon from '../../../icons/volume_up.svg';
import VolumeOffIcon from '../../../icons/volume_off.svg';
import styles from './MediaControls.module.css';

const MediaVolume = ({
  setVolume,
  videoRef,
  volume,
}) => {
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
    <div className={styles['media-controls-volume']} id="media-volume">
      <Slider
        className={styles['media-controls-volume-slider']}
        id="media-volume-slider"
        max={1}
        min={0}
        step={0.01}
        value={volume}
        onChange={handleChange}
      />
      <ButtonMain
        className={isVolumeOff ? 'int-button__icon--vol-off' : 'int-button__icon--vol-up'}
        iconCenter={isVolumeOff ? <VolumeOffIcon /> : <VolumeUpIcon />}
        size="default"
        theme="white"
        variant="text"
        onClick={handleMute}
      />
    </div>
  );
};

MediaVolume.propTypes = {
};

MediaVolume.defaultProps = {
};

export default MediaVolume;
