/* eslint-disable */
import React, { Component } from 'react';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import qs from 'qs';

import { Player } from '@meedan/check-ui';
import { Timeline } from '@meedan/check-ui';

import { entityCreate, entityUpdate, entityDelete, instanceCreate, instanceUpdate, instanceDelete, instanceClip } from './VideoTimelineUtils';

const environment = Store;

const NOOP = () => {};

class VideoTimelineContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      duration: 0,
      playing: false,
      time: 0,
      progress: 0,
      refetch: 0,
    };
  }

  render() {
    const { params: { mediaId, projectId } } = this.props;
    const {
      playing, duration, time, progress, seekTo, scrubTo, refetch
    } = this.state;

    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query VideoTimelineContainerQuery($ids: String!) {
            project_media(ids: $ids) {
              id
              metadata
              tags(first: 10000) @connection(key: "ProjectMedia_tags") {
                edges {
                  node {
                    id
                    fragment
                    tag_text_object {
                      id
                      text
                    }
                  }
                }
              }
            }
          }
        `}
        variables={{ ids: `${mediaId},${projectId}`, refetch }}
        render={({ error, props, retry }) => {
          if (!error && props) {
            const { project_media: { metadata: { title, url }, tags: { edges = [] } } } = props;

            const projecttags = [];
            const entities = {};

            edges
              .filter(({ node }) => !!node)
              .forEach(({ node: { id: instance, fragment, tag_text_object } }) => {
                if (!tag_text_object) return;

                const { id, text: name } = tag_text_object;
                if (!fragment) return projecttags.push({ id, name });

                if (!entities[id]) entities[id] = { id, name, project_tag: { id, name }, instances: [] };

                const { t = '0,0', type = 'tag' } = qs.parse(fragment);
                const [start_seconds, end_seconds] = t.split(',').map(n => parseFloat(n));

                entities[id].type = type;
                entities[id].instances.push({ start_seconds, end_seconds, id: instance });
              });

            const data = {
              commentThreads: [],
              project: {
                projectclips: [],
                projectplaces: [],
                projecttags,
              },
              videoClips: [],
              videoPlaces: [],
              videoTags: Object.values(entities).filter(({ type }) => type === 'tag' || type === 'tags'),
              user: {},
            };

            return (
              <div>                
                <h1>{title}</h1>
                <Player
                  url={url}
                  playing={playing}
                  onDuration={d => this.setState({ duration: d })}
                  onPlay={() => this.setState({ playing: true })}
                  onPause={() => this.setState({ playing: false })}
                  onTimeUpdate={t => this.setState({ time: t })}
                  onProgress={p => this.setState({ progress: p })}
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
                  onChange={e => this.setState({ seekTo: e.nativeEvent.target.value })}
                  onMouseUp={() => this.setState({ seekTo: null })}
                  onMouseOut={() => this.setState({ seekTo: null })}
                  onBlur={() => this.setState({ seekTo: null })}
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={time}
                  style={{ width: '100%' }}
                />
                scrubTo: {scrubTo} <br />
                <input
                  onChange={e => this.setState({ scrubTo: e.nativeEvent.target.value, seekTo: null })}
                  onMouseUp={() => this.setState({ scrubTo: null })}
                  onMouseOut={() => this.setState({ scrubTo: null })}
                  onBlur={() => this.setState({ scrubTo: null })}
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={time}
                  style={{ width: '100%' }}
                />
                <hr />
                <Timeline
                  currentTime={time}
                  data={data}
                  duration={duration}
                  onBeforeCommentThreadCreate={NOOP}
                  onCommentCreate={NOOP}
                  onCommentDelete={NOOP}
                  onCommentEdit={NOOP}
                  onCommentThreadCreate={NOOP}
                  onCommentThreadDelete={NOOP}
                  onEntityCreate={(type, payload, callback) => entityCreate(type, payload, mediaId, props.project_media.id, callback)}
                  onEntityDelete={(type, entityId, callback) => entityDelete(type, entityId, data.videoTags.find(({ id }) => entityId === id).instances, mediaId, callback)}
                  onEntityUpdate={(type, entityId, payload, callback) => entityUpdate(type, entityId, payload, callback)}
                  onInstanceClip={(type, entityId, instanceId) => instanceClip(type, entityId, instanceId)}
                  onInstanceCreate={(type, id, payload, callback) => instanceCreate(type, id, data.videoTags.find(({ id: _id }) => _id === id).name, payload, mediaId, props.project_media.id, callback)}
                  onInstanceDelete={(type, entityId, instanceId) => instanceDelete(type, instanceId, mediaId)}
                  onInstanceUpdate={(type, entityId, instanceId, { start_seconds, end_seconds }) => instanceUpdate(type, entityId, instanceId, `t=${start_seconds},${end_seconds}&type=${type}`)}
                  onPlaylistLaunch={NOOP}
                  onTimeChange={seekTo => this.setState({ seekTo })}
                />
              </div>
            );
          } else if (!error) return <h1>loading…</h1>;

          return <h1>Error</h1>;
        }} />
    );
  }
}

export default VideoTimelineContainer;
