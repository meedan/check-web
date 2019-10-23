import React from 'react';
import VideoPlayer from 'react-video-js-player';

const VideoMediaCard = props => (
  <article className="video-media-card">
    <VideoPlayer
      controls
      src={props.videoPath}
      poster={props.posterPath}
      width="auto"
      height="420"
    />
  </article>);

export default VideoMediaCard;
