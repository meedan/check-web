import React from 'react';
import VideoPlayer from 'react-video-js-player';
import '../../styles/css/player.css';

const VideoMediaCard = props => (
  <article className="video-media-card">
    <VideoPlayer
      controls
      src={props.videoPath}
      poster={props.posterPath}
      height="420"
      className="video-media-player"
    />
  </article>);

export default VideoMediaCard;
