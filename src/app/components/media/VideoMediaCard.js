import React from 'react';
import { Player } from '@meedan/check-ui';
import '../../styles/css/player.css';

const VideoMediaCard = props => (
  <article className="video-media-card">
    <Player
      url={props.videoPath}
      className="video-media-player"
    />
  </article>);

export default VideoMediaCard;
