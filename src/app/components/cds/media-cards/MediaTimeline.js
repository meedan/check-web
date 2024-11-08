import React from 'react';
// import PropTypes from 'prop-types';
import { Slider } from '@material-ui/core';
import cx from 'classnames/bind';
import styles from './MediaControls.module.css';

const MediaTimeline = ({
  currentTime,
  duration,
  setCurrentTime,
  videoRef,
}) => {
  const handleChange = (event, newValue) => {
    setCurrentTime(newValue);
  };

  const handleCommit = (event, newValue) => {
    const video = videoRef.current;
    video.currentTime = newValue;
  };

  return (
    <Slider
      className={cx(styles['media-timeline'])}
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
