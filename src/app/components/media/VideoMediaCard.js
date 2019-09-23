import React from 'react';
import { Player, ControlBar, BigPlayButton } from 'video-react';

const VideoMediaCard = props => (
  <article className="video-media-card">
    <Player autoPlay src={props.videoPath} poster={props.posterPath} >
      <BigPlayButton position="center" />
      <ControlBar autoHide={false} className="media-video-class" />
    </Player>
  </article>);

export default VideoMediaCard;
