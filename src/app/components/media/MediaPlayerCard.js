import React from 'react';
import { Player } from '@meedan/check-ui';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import AspectRatio from '../layout/AspectRatio';
import { units } from '../../styles/js/shared';

const StyledPlaybackRate = styled.div`
  margin-top: ${units(2)};
  position: absolute;
  right: 0;
`;

const MediaPlayerCard = (props) => {
  const [playbackRate, setplaybackRate] = React.useState(1);

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
      <StyledPlaybackRate>
        <FormControl variant="outlined">
          <Select
            id="video-media-card__playback-rate"
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
        </FormControl>
      </StyledPlaybackRate>
    </article>
  );
};

export default MediaPlayerCard;
