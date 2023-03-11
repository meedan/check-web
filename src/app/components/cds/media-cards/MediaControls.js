import React from 'react';
// import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import {
  Grid,
  IconButton,
  Typography,
} from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import MediaTimeline from './MediaTimeline';
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

  const PlayButton = () => (
    <IconButton
      onClick={() => {
        if (isPlaying) {
          videoRef.current?.pause();
          setIsPlaying(false);
        } else {
          videoRef.current?.play();
          setIsPlaying(true);
        }
      }}
    >
      { isPlaying ? <PauseIcon /> : <PlayArrowIcon /> }
    </IconButton>
  );

  const TimeDisplay = () => (
    <Typography>{currentTime} / {duration}</Typography>
  );

  return (
    <>
      <Grid
        container
        className={classes.root}
        display="flex"
        alignItems="center"
      >
        <Grid item xs={6}>
          <PlayButton />
        </Grid>
        <Grid item xs={6}>
          <TimeDisplay />
        </Grid>
        <Grid item xs={12}>
          <MediaTimeline
            currentTime={currentTime}
            duration={duration}
            videoRef={videoRef}
          />
        </Grid>
      </Grid>
    </>
  );
};

MediaControls.propTypes = {
};

MediaControls.defaultProps = {
};

export default MediaControls;
