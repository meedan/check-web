import React from 'react';
import VideoJsPlayer from '../VideoJsPlayer';
import '../../styles/css/player.css';

const VideoMediaCard = props => (
  <article className="video-media-card">
    <VideoJsPlayer
      controls
      src={props.videoPath}
      poster={props.posterPath}
      height="420"
      className="video-media-player"
    />
  </article>);

export default VideoMediaCard;
