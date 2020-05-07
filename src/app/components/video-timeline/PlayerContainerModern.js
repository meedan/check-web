/* eslint-disable */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { Player } from '@meedan/check-ui';

import environment from '../../CheckNetworkLayerModern';

const PlayerContainer = ({
  playing, duration, time, progress, seekTo, scrubTo, update, params: { mediaId, projectId },
}) => (
  <QueryRenderer
    environment={environment}
    query={graphql`
      query PlayerContainerModernQuery($ids: String!) {
        project_media(ids: $ids) {
          metadata
        }
      }
    `}
    variables={{ ids: `${mediaId},${projectId}` }}
    render={({ error, props }) => {
      // console.log({ error, props });

      if (!error && props) {
        const { project_media: { metadata: { title, url } } } = props;
        return (
          <div>
            <h1>{title}</h1>
            <Player
              url={url}
              playing={playing}
              onDuration={d => update({ duration: d })}
              onPlay={() => update({ playing: true })}
              onPause={() => update({ playing: false })}
              onTimeUpdate={t => update({ time: t })}
              onProgress={p => update({ progress: p })}
              seekTo={seekTo}
              scrubTo={scrubTo}
            />
            <hr />
            Duration: {duration} <br />
            Progress: {progress} <br />
            <input disabled type="range" min="0" max={duration} value={progress} style={{ width: '100%' }} />
            Time: {time} <br />
            seekTo: {seekTo} <br />
            <input
              onChange={e => update({ seekTo: e.nativeEvent.target.value })}
              onMouseUp={() => update({ seekTo: null })}
              onMouseOut={() => update({ seekTo: null })}
              onBlur={() => update({ seekTo: null })}
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={time}
              style={{ width: '100%' }}
            />
            scrubTo: {scrubTo} <br />
            <input
              onChange={e => update({ scrubTo: e.nativeEvent.target.value, seekTo: null })}
              onMouseUp={() => update({ scrubTo: null })}
              onMouseOut={() => update({ scrubTo: null })}
              onBlur={() => update({ scrubTo: null })}
              type="range"
              min="0"
              max={duration}
              step="0.1"
              value={time}
              style={{ width: '100%' }}
            />
          </div>
        );
      } else if (!error) {
        return <p>loading…</p>;
      }

      return <p>Error!</p>;
    }}
  />
);

export default PlayerContainer;
