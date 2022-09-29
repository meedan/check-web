import React from 'react';
import PropTypes from 'prop-types';
import { Player } from '@meedan/check-ui';
import AspectRatio from '../layout/AspectRatio';

const MediaPlayerCard = props => (
  <article className="video-media-card" style={{ position: 'relative' }}>
    <AspectRatio
      key={props.contentWarning}
      contentWarning={props.contentWarning}
      warningCreator={props.warningCreator}
      warningCategory={props.warningCategory}
    >
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

MediaPlayerCard.propTypes = {
  contentWarning: PropTypes.bool,
  warningCreator: PropTypes.string,
  warningCategory: PropTypes.string,
  coverImage: PropTypes.string,
  filePath: PropTypes.string.isRequired,
  playbackRate: PropTypes.number,
  setPlayerState: PropTypes.func,
  onPlayerReady: PropTypes.func,
  playing: PropTypes.bool,
  start: PropTypes.number,
  end: PropTypes.number,
  gaps: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  scrubTo: PropTypes.number,
  seekTo: PropTypes.number,
};

MediaPlayerCard.defaultProps = {
  contentWarning: false,
  warningCreator: '',
  warningCategory: '',
  coverImage: '',
  playbackRate: 1,
  setPlayerState: () => {},
  onPlayerReady: () => {},
  playing: false,
  start: null,
  end: null,
  gaps: [],
  scrubTo: null,
  seekTo: null,
};

export default MediaPlayerCard;
