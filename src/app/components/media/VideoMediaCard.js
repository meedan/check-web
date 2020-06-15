import React from 'react';
import { Player } from '@meedan/check-ui';
import AspectRatio from '../layout/AspectRatio';
import '../../styles/css/player.css';

const VideoMediaCard = props => (
  <article className="video-media-card">
    <AspectRatio>
      <Player
        url={props.videoPath}
        className="video-media-player"
      />
    </AspectRatio>
  </article>);

export default VideoMediaCard;
