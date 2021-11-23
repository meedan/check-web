import React from 'react';
import { Player } from '@meedan/check-ui';
import AspectRatio from '../layout/AspectRatio';

const MediaPlayerCard = props => (
  <article className="video-media-card" style={{ position: 'relative' }}>
    <AspectRatio contentWarning={props.contentWarning}>
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
          playbackRate={props.playbackRate}
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
  </article>
);

export default MediaPlayerCard;
