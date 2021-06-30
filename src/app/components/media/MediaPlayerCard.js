import React from 'react';
import Box from '@material-ui/core/Box';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import { Player } from '@meedan/check-ui';
import { FormattedMessage } from 'react-intl';
import AspectRatio from '../layout/AspectRatio';
import { units } from '../../styles/js/shared';

const useStyles = makeStyles({
  input: {
    maxHeight: 30,
    '@media (max-width: 1300px)': {
      maxWidth: 65,
      overflow: 'hidden',
    },
  },
});

const MediaPlayerCard = (props) => {
  const [playbackRate, setplaybackRate] = React.useState(1);
  const classes = useStyles();

  return (
    <article className="video-media-card" style={{ position: 'relative' }}>
      <AspectRatio>
        { props.coverImage ? (
          <img
            src={props.coverImage}
            alt=""
          />
        ) : null }
        <div className="aspect-ratio__overlay">
          <Player
            url={props.filePath}
            className="video-media-player"
            playbackRate={playbackRate}
            onDuration={d => props.setPlayerState({ duration: d })}
            onPause={() => props.setPlayerState({ playing: false, gaps: [] })}
            onPlay={() => props.setPlayerState({ playing: true })}
            onProgress={p => props.setPlayerState({ progress: p })}
            onReady={props.onPlayerReady}
            onTimeUpdate={t => props.setPlayerState({ time: t })}
            playing={props.playing}
            start={props.start}
            end={props.end}
            gaps={props.gaps}
            scrubTo={props.scrubTo}
            seekTo={props.seekTo}
          />
        </div>
      </AspectRatio>
      <Box marginTop={units(2)} position="absolute" right={0}>
        <Select
          size="small"
          id="video-media-card__playback-rate"
          input={<OutlinedInput className={classes.input} />}
          value={playbackRate}
          onChange={e => setplaybackRate(e.target.value)}
        >
          <MenuItem value={0.25}>0.25x</MenuItem>
          <MenuItem value={0.5}>0.5x</MenuItem>
          <MenuItem value={0.75}>0.75x</MenuItem>
          <MenuItem value={1}><FormattedMessage id="media.normalSpeed" defaultMessage="Normal speed" /></MenuItem>
          <MenuItem value={1.25}>1.25x</MenuItem>
          <MenuItem value={1.5}>1.5x</MenuItem>
          <MenuItem value={1.75}>1.75x</MenuItem>
          <MenuItem value={2}>2x</MenuItem>
        </Select>
      </Box>
    </article>
  );
};

export default MediaPlayerCard;
