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
// import { brandBorder, grayBorderAccent, otherWhite, textPrimary } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: 'red',
    position: 'absolute',
    bottom: '20px',
    width: '100%',
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  innerBox: {
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
    videoRef.current.addEventListener('loadedmetadata', () => {
      setDuration(videoRef.current.duration);
    });
    videoRef.current.addEventListener('timeupdate', () => {
      setCurrentTime(videoRef.current.currentTime);
    });
    videoRef.current.addEventListener('ended', () => {
      setIsPlaying(false);
    });
  }, []);

  const PlayButton = () => {
    const handleClick = () => {
      // eslint-disable-next-line
      console.log('~~~',currentTime);
      if (isPlaying) {
        videoRef.current?.pause();
        setIsPlaying(false);
      } else {
        videoRef.current?.play();
        setIsPlaying(true);
      }
    };

    return (
      <IconButton
        onPointerUp={handleClick}
      >
        { isPlaying ? <PauseIcon /> : <PlayArrowIcon /> }
      </IconButton>
    );
  };

  const TimeDisplay = () => (
    <Box>
      <Typography>{currentTime} / {duration}</Typography>
    </Box>
  );

  return (
    <>
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
