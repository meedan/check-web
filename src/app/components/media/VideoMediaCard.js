import React from 'react';
import { Player } from '@meedan/check-ui';
import AspectRatio from '../layout/AspectRatio';

const VideoMediaCard = props => (
  <article className="video-media-card">
    <AspectRatio>
      <Player
        url={props.videoPath}
        className="video-media-player"
        key={`${props.videoPath}#t=${props.start},${props.end}`}
        onDuration={d => props.setPlayerState({ duration: d })}
        onPause={() => props.setPlayerState({ playing: false })}
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
    </AspectRatio>
  </article>);

export default VideoMediaCard;
