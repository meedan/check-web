import React from 'react';
// import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import MediaTimeline from './MediaTimeline';
import MediaVolume from './MediaVolume';
import MediaPlaybackSpeed from './MediaPlaybackSpeed';

const useStyles = makeStyles(theme => ({
  root: {
    color: 'var(--otherWhite)',
    background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.31) 51.56%, rgba(0, 0, 0, 0.7) 100%)',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: theme.spacing(1.5, 1, 0, 1),
  },
  icon: {
    color: 'var(--otherWhite)',
    marginRight: theme.spacing(1),
    '&:hover': {
      color: 'var(--otherWhite)',
      backgroundColor: 'var(--overlayLight)',
    },
  },
  overlay: {
    position: 'absolute',
    top: 0,
    height: '100%',
    width: '100%',
  },
}));

const MediaControls = ({
  videoRef,
}) => {
  const classes = useStyles();
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
    <IconButton
      className={classes.icon}
      onPointerUp={togglePlay}
      size="small"
    >
      { isPlaying ? <PauseIcon /> : <PlayArrowIcon /> }
    </IconButton>
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
    <Box>
      <Typography>{prettyPrintTime(currentTime)} / {durationDisplay}</Typography>
    </Box>
  );

  return (
    <>
      <div className={classes.overlay} onPointerUp={togglePlay} onKeyUp={togglePlay} />
      <Grid
        container
        className={classes.root}
        display="flex"
        alignItems="center"
      >
        <Grid
          container
          item
          alignItems="center"
          xs={6}
        >
          <PlayButton />
          <TimeDisplay />
        </Grid>
        <Grid
          container
          item
          alignItems="center"
          justify="flex-end"
          xs={6}
        >
          <Grid item container xs={6} justify="flex-end">
            <MediaVolume
              volume={volume}
              setVolume={setVolume}
              videoRef={videoRef}
            />
          </Grid>
          <Box display="flex" alignItems="center">
            <MediaPlaybackSpeed
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              videoRef={videoRef}
            />
          </Box>
        </Grid>
        <MediaTimeline
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          duration={duration}
          videoRef={videoRef}
        />
      </Grid>
    </>
  );
};

MediaControls.propTypes = {
};

MediaControls.defaultProps = {
};

export default MediaControls;
