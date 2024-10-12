import React from 'react';
// import PropTypes from 'prop-types';
import MediaTimeline from './MediaTimeline';
import MediaVolume from './MediaVolume';
import MediaPlaybackSpeed from './MediaPlaybackSpeed';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import PauseIcon from '../../../icons/pause.svg';
import PlayArrowIcon from '../../../icons/play_arrow.svg';
import styles from './MediaControls.module.css';

const MediaControls = ({
  videoRef,
}) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [volume, setVolume] = React.useState(0.75);
  const [playbackSpeed, setPlaybackSpeed] = React.useState(1);

  // We need to do all our event listener setup in the effect in order to make sure the video reference is not null on component load. This effect only runs once on component mount due to the empty array in the second parameter.
  React.useEffect(() => {
    const video = videoRef.current;
    video.addEventListener('loadedmetadata', () => {
      setDuration(videoRef.current?.duration);
    });
    video.addEventListener('timeupdate', () => {
      setCurrentTime(videoRef.current?.currentTime);
    });
    video.addEventListener('ended', () => {
      setIsPlaying(false);
    });
    video.volume = volume;
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
    } else {
      videoRef.current?.play();
      setIsPlaying(true);
    }
  };

  const PlayButton = () => (
    <ButtonMain
      iconCenter={isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
      size="default"
      theme="white"
      variant="text"
      onPointerUp={togglePlay}
    />
  );

  const prettyPrintTime = (seconds) => {
    let sliceOffset = 0;
    // if video less than ten minutes, only show m:ss
    if (duration < 600) {
      sliceOffset = 4;
    } else if (duration < 3600) {
      // if video is less than 1 hour, show only mm:ss
      sliceOffset = 3;
    }
    return new Date(seconds * 1000).toISOString().slice(11 + sliceOffset, 19);
  };
  const durationDisplay = prettyPrintTime(duration);
  const TimeDisplay = () => (
    <div>
      {prettyPrintTime(currentTime)} / {durationDisplay}
    </div>
  );

  return (
    <>
      <div className={styles['media-controls-overlay']} onKeyUp={togglePlay} onPointerUp={togglePlay} />
      <div className={styles['media-controls']}>
        <div className={styles['media-controls-play-time']}>
          <PlayButton />
          <TimeDisplay />
        </div>
        <div className={styles['media-controls-volume-speed']}>
          <MediaVolume
            setVolume={setVolume}
            videoRef={videoRef}
            volume={volume}
          />
          <MediaPlaybackSpeed
            playbackSpeed={playbackSpeed}
            setPlaybackSpeed={setPlaybackSpeed}
            videoRef={videoRef}
          />
        </div>
        <MediaTimeline
          currentTime={currentTime}
          duration={duration}
          setCurrentTime={setCurrentTime}
          videoRef={videoRef}
        />
      </div>
    </>
  );
};

MediaControls.propTypes = {
};

MediaControls.defaultProps = {
};

export default MediaControls;
