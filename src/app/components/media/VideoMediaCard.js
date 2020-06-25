import React from 'react';
import { Player } from '@meedan/check-ui';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import styled from 'styled-components';
import AspectRatio from '../layout/AspectRatio';
import { units } from '../../styles/js/shared';

const StyledPlaybackRate = styled.div`
  margin-top: ${units(2)};
  position: absolute;
  right: 0;
`;

const VideoMediaCard = (props) => {
  const [playbackRate, setplaybackRate] = React.useState(1);

  return (
    <article className="video-media-card" style={{ position: 'relative' }}>
      <AspectRatio>
        <Player
          url={props.videoPath}
          className="video-media-player"
          playbackRate={playbackRate}
        />
      </AspectRatio>
      <StyledPlaybackRate>
        <FormControl variant="outlined">
          <Select
            id="video-media-card__playback-rate"
            value={playbackRate}
            onChange={e => setplaybackRate(e.target.value)}
          >
            <MenuItem value={1}>1x</MenuItem>
            <MenuItem value={1.5}>1.5x</MenuItem>
            <MenuItem value={2}>2x</MenuItem>
          </Select>
        </FormControl>
      </StyledPlaybackRate>
    </article>
  );
};

export default VideoMediaCard;
