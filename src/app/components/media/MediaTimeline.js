/* eslint-disable no-shadow */
import React, { Component } from 'react';
import { Timeline } from '@meedan/check-ui';
import qs from 'qs';

import {
  createClip, renameClip, destroyClip, retimeClip,
  createCommentThread, destroyComment, createComment, updateComment,
  createTag, renameTag, destroyTag, retimeTag,
  createPlace,
} from './MediaTimelineUtils';

const NOOP = () => {};

class MediaTimeline extends Component {
  static getDerivedStateFromProps({
    media: {
      id: mediaId, dbid,
      tags: { edges: tags = [] },
      clips: { edges: clips = [] },
      geolocations: { edges: locations = [] },
      comments,
    },
    duration, time,
    currentUser: { name: first_name, id: userId, profile_image: profile_img_url },
  }) {
    const projecttags = [];
    const entities = {};

    console.log({
      mediaId, dbid, tags, clips, comments, locations,
    });

    const commentThreads = comments.edges.filter(({ node: { dbid } }) => !!dbid).map(({
      node: {
        id: thread_id, dbid, text, parsed_fragment,
        annotator: {
          id: annoId, name, profile_image,
        },
        comments,
      },
    }) => ({
      id: thread_id,
      dbid,
      text,
      start_seconds: parsed_fragment.t[0],
      user: {
        id: annoId,
        first_name: name,
        last_name: '',
        profile_img_url: profile_image,
      },
      replies: comments && comments.edges ? comments.edges.map(({
        node: {
          id, created_at, text,
          annotator: {
            id: annoId, name, profile_image,
          },
        },
      }) => ({
        id,
        thread_id,
        created_at,
        text,
        start_seconds: 0,
        user: {
          id: annoId,
          first_name: name,
          last_name: '',
          profile_img_url: profile_image,
        },
      })).sort((a, b) => a.created_at - b.created_at) : [],
    }));

    clips.filter(({ node: { id } }) => !!id).forEach(({
      node: { id, parsed_fragment: { t: [start_seconds, end_seconds] }, data: { label: name } },
    }) => {
      if (!entities[`clip-${name}`]) {
        entities[`clip-${name}`] = {
          id: `clip-${name}`,
          name,
          type: 'clip',
          project_clip: { id: `clip-${name}`, name },
          instances: [],
        };
      }

      entities[`clip-${name}`].instances.push({
        id,
        start_seconds,
        end_seconds,
        url: new URL(`#t=${start_seconds},${end_seconds}&id=${encodeURIComponent(id)}`, document.location.href).href,
      });
    });

    tags
      .filter(({ node }) => !!node)
      .forEach(({ node: { id: instance, fragment, tag_text_object } }) => {
        if (!tag_text_object) return;

        const { id, text: name } = tag_text_object;
        if (!fragment) {
          projecttags.push({ id, name });
          return;
        }

        if (!entities[id]) {
          entities[id] = {
            id, name, project_tag: { id, name }, instances: [],
          };
        }

        const { t = '0,0', type = 'tag' } = qs.parse(fragment);
        const [start_seconds, end_seconds] = t.split(',').map(n => parseFloat(n));

        entities[id].type = type;
        entities[id].instances.push({ start_seconds, end_seconds, id: instance });
      });

    locations.filter(({ node: { id } }) => !!id).forEach(({
      node: { id, parsed_fragment: { t: [start_seconds, end_seconds] }, content },
    }) => {
      const {
        geolocation_viewport: { viewport, zoom = 10 },
        geolocation_location,
      } = JSON.parse(content).reduce((acc, { field_name, value_json }) =>
        ({ ...acc, [field_name]: value_json }), {});
      const {
        properties: { name = id.trim() } = {},
        geometry: { type = 'Point', coordinates = [0, 0] } = {},
      } = geolocation_location;
      const [lng, lat] = coordinates;

      if (!entities[`place-${name}`]) {
        entities[`place-${name}`] = {
          id: `place-${name}`,
          name,
          viewport,
          zoom,
          lat,
          lng,
          type: type === 'Point' ? 'marker' : 'polygon',
          test: { geolocation_location },
          project_place: { id: `place-${name}`, name },
          instances: [],
        };

        if (type === 'Polygon') {
          entities[`place-${name}`].polygon = []; // coordinates.map();
        }
      }

      entities[`place-${name}`].instances.push({ id, start_seconds, end_seconds });
    });

    const data = {
      project: {
        projectclips: projecttags,
        projecttags,
        projectplaces: projecttags,
      },
      commentThreads,
      videoClips: Object.values(entities).filter(({ project_clip }) => !!project_clip),
      videoTags: Object.values(entities).filter(({ project_tag }) => !!project_tag),
      videoPlaces: Object.values(entities).filter(({ project_place }) => !!project_place),
      user: {
        first_name,
        id: userId,
        last_name: '',
        profile_img_url,
      },
    };

    console.log({ data });

    return {
      duration, time, data, mediaId, dbid,
    };
  }

  componentDidUpdate() {
    const { fragment: { t, id } = {} } = this.props;
    const instance = t && id ? document.querySelector(`*[data-instance-id="clip-${id.trim()}"]`) : null;
    console.log({ instance });
    if (instance) {
      instance.style.outline = '2px solid #2e77fc';
      instance.scrollIntoView();
    }
  }

  commentThreadCreate = (time, text, callback) => {
    const { mediaId, dbid } = this.state;
    createCommentThread(text, `t=${time}`, `${dbid}`, mediaId, callback);
  };

  commentThreadDelete = (id, callback) => {
    const { dbid } = this.state;
    destroyComment(id, dbid, callback);
  };

  commentCreate = (threadId, text, callback) => {
    const { data: { commentThreads } } = this.state;
    const id = commentThreads.find(({ id }) => id === threadId).dbid;
    createComment(text, null, `${id}`, threadId, callback);
  };

  commentEdit = (threadId, commentId, text, callback) => updateComment(commentId, text, callback);

  commentDelete = (threadId, commentId) => destroyComment(commentId, threadId);

  instanceClip = (type, entityId, instanceId) => {
    const { mediaId, dbid, data: { videoTags } } = this.state;

    switch (type) {
    case 'tag': {
      const { name, instances = [] } = videoTags.find(({ id }) => id === entityId);
      const { start_seconds, end_seconds } = instances.find(({ id }) => id === instanceId);

      console.log(name, `t=${start_seconds},${end_seconds}`, `${dbid}`, mediaId);
      createClip(name, `t=${start_seconds},${end_seconds}`, `${dbid}`, mediaId);
      break;
    }
    default:
      console.error(`${type} not handled`);
    }
  };

  entityCreate = (type, payload, callback) => {
    const { mediaId, dbid } = this.state;

    switch (type) {
    case 'tag':
      createTag(payload[`project_${type}`].name, payload.fragment, `${dbid}`, mediaId, callback);
      break;
    case 'clip':
      createClip(payload[`project_${type}`].name, payload.fragment, `${dbid}`, mediaId, callback);
      break;
    case 'place':
      console.log({ type, payload });
      createPlace(payload[`project_${type}`].name, payload, `${dbid}`, mediaId, callback);
      break;
    default:
      console.error(`${type} not handled`);
    }
  };

  entityUpdate = (type, entityId, payload, callback) => {
    const { dbid, data: { videoClips } } = this.state;

    switch (type) {
    case 'tag':
      renameTag(entityId, payload.project_tag.name, callback);
      break;
    case 'clip':
      console.log('renameClip', entityId, payload.project_clip.name);
      videoClips.find(({ id }) =>
        entityId === id).instances.forEach(({ id }) =>
        renameClip(id, payload.project_clip.name, dbid));
      if (callback) callback();
      break;
    default:
      console.error(`${type} not handled`);
    }
  };

  entityDelete = (type, entityId, callback) => {
    const { dbid, data: { videoTags, videoClips } } = this.state;

    switch (type) {
    case 'tag':
      videoTags.find(({ id }) =>
        entityId === id).instances.forEach(({ id }) => destroyTag(id, dbid));
      if (callback) callback();
      break;
    case 'clip':
      videoClips.find(({ id }) =>
        entityId === id).instances.forEach(({ id }) => destroyClip(id, dbid));
      if (callback) callback();
      break;
    default:
      console.error(`${type} not handled`);
    }
  };

  instanceCreate = (type, id, payload, callback) => {
    const { mediaId, dbid, data: { videoTags } } = this.state;

    switch (type) {
    case 'tag': {
      const { name } = videoTags.find(({ id: _id }) => _id === id);
      createTag(name, payload.fragment, `${dbid}`, mediaId, callback);
      break;
    }
    case 'clip':
      createClip(id.substring(5), payload.fragment, `${dbid}`, mediaId, callback);
      break;
    default:
      console.error(`${type} not handled`);
    }
  };

  instanceUpdate = (type, entityId, instanceId, { start_seconds, end_seconds }) => {
    const fragment = `t=${start_seconds},${end_seconds}&type=${type}`;
    const parsed_fragment = { t: [start_seconds, end_seconds] };

    switch (type) {
    case 'tag':
      retimeTag(instanceId, fragment);
      break;
    case 'clip':
      retimeClip(instanceId, fragment, parsed_fragment);
      break;
    default:
      console.error(`${type} not handled`);
    }
  };

  instanceDelete = (type, entityId, instanceId) => {
    const { dbid } = this.state;

    switch (type) {
    case 'tag':
      destroyTag(instanceId, dbid);
      break;
    case 'clip':
      destroyClip(instanceId, dbid);
      break;
    default:
      console.error(`${type} not handled`);
    }
  };

  playlistLaunch = (type) => {
    const { data } = this.state;

    switch (type) {
    case 'clips':
      console.warn('TODO playlist clips', data);
      break;
    case 'tags':
      console.warn('TODO playlist tags', data);
      break;
    default:
      console.error(`${type} not handled`);
    }
  };

  timeChange = seekTo => this.props.setPlayerState({ seekTo });

  render() {
    const { data, duration, time } = this.state;
    const { setPlayerState } = this.props;

    return (
      <Timeline
        currentTime={time}
        data={data}
        duration={duration}
        onBeforeCommentThreadCreate={NOOP}
        onCommentCreate={this.commentCreate}
        onCommentDelete={this.commentDelete}
        onCommentEdit={this.commentEdit}
        onCommentThreadCreate={this.commentThreadCreate}
        onCommentThreadDelete={this.commentThreadDelete}
        onEntityCreate={this.entityCreate}
        onEntityDelete={this.entityDelete}
        onEntityUpdate={this.entityUpdate}
        onInstanceClip={this.instanceClip}
        onInstanceCreate={this.instanceCreate}
        onInstanceDelete={this.instanceDelete}
        onInstanceUpdate={this.instanceUpdate}
        onPlaylistLaunch={this.playlistLaunch}
        onTimeChange={seekTo => setPlayerState({ seekTo })}
        onScrub={scrub => console.log({ scrub })}
      />
    );
  }
}

export default MediaTimeline;
