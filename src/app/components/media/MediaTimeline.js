/* eslint-disable no-sequences */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable no-console */
/* eslint-disable no-shadow */
import React, { Component } from 'react';
import { Timeline } from '@meedan/check-ui';
import qs from 'qs';

import {
  createClip, renameClip, destroyClip, retimeClip,
  createCommentThread, destroyComment, createComment, updateComment,
  createTag, renameTag, destroyTag, retimeTag,
  createPlace, createPlaceInstance, retimePlace, destroyPlace, renamePlace,
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
      node,
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
      node,
    }));

    clips.filter(({ node: { id } }) => !!id).forEach(({
      node,
      node: { id, parsed_fragment: { t: [start_seconds, end_seconds] }, data: { label: name } },
    }) => {
      if (!entities[`clip-${name}`]) {
        entities[`clip-${name}`] = {
          id: `clip-${name}`,
          name,
          type: 'clip',
          project_clip: { id: `clip-${name}`, name },
          instances: [],
          node,
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
      .forEach(({ node, node: { id: instance, fragment, tag_text_object } }) => {
        if (!tag_text_object) return;

        const { id, text: name } = tag_text_object;
        if (!fragment) {
          projecttags.push({ id, name });
          return;
        }

        if (!entities[id]) {
          entities[id] = {
            id, name, project_tag: { id, name }, instances: [], node,
          };
        }

        const { t = '0,0', type = 'tag' } = qs.parse(fragment);
        const [start_seconds, end_seconds] = t.split(',').map(n => parseFloat(n));

        entities[id].type = type;
        entities[id].instances.push({ start_seconds, end_seconds, id: instance });
      });

    locations.filter(({ node: { id } }) => !!id).forEach(({
      node, node: { id, parsed_fragment: { t: [start_seconds, end_seconds] }, content },
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
          node,
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
    const { fragment: { id } = {} } = this.props;
    const instance = id ? document.querySelector(`*[data-instance-id="clip-${id.trim()}"]`) : null;

    const outline = '2px solid #2e77fc';

    if (instance && instance.style.outline !== outline) {
      instance.style.outline = outline;
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
    const { mediaId, dbid, data: { videoTags, videoPlaces } } = this.state;
    console.log({ type, entityId, instanceId });

    switch (type) {
    case 'tag': {
      const { project_tag: { name }, instances = [] } = videoTags.find(({ id }) => id === entityId);
      const { start_seconds, end_seconds } = instances.find(({ id }) => id === instanceId);

      console.log(name, `t=${start_seconds},${end_seconds}`, `${dbid}`, mediaId);
      createClip(name, `t=${start_seconds},${end_seconds}`, `${dbid}`, mediaId);
      break;
    }
    case 'place': {
      const { name, instances = [] } = videoPlaces.find(({ id }) => id === entityId);
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
    const { dbid, data: { videoClips, videoPlaces } } = this.state;

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
    case 'place': {
      console.log('renamePlace', entityId, payload.project_place.name);
      const { instances, node } = videoPlaces.find(({ id }) => entityId === id);
      console.log({ node });
      instances.forEach(({ id }) =>
        renamePlace(id, payload.project_place.name, node.content, dbid));
      if (callback) callback();
      break;
    }
    default:
      console.error(`${type} not handled`);
    }
  };

  entityDelete = (type, entityId, callback) => {
    const { dbid, data: { videoTags, videoClips, videoPlaces } } = this.state;

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
    case 'place':
      videoPlaces.find(({ id }) =>
        entityId === id).instances.forEach(({ id }) => destroyPlace(id, dbid));
      break;
    default:
      console.error(`${type} not handled`);
    }
  };

  instanceCreate = (type, id, payload, callback) => {
    const { mediaId, dbid, data: { videoTags, videoPlaces } } = this.state;

    switch (type) {
    case 'tag': {
      const { name } = videoTags.find(({ id: _id }) => _id === id);
      createTag(name, payload.fragment, `${dbid}`, mediaId, callback);
      break;
    }
    case 'clip':
      createClip(id.substring(5), payload.fragment, `${dbid}`, mediaId, callback);
      break;
    case 'place': {
      const place = videoPlaces.find(({ id: _id }) => _id === id);
      createPlaceInstance(id.substring(6), payload, JSON.parse(place.node.content), `${dbid}`, mediaId, callback);
      break;
    }
    default:
      console.error(`${type} not handled`);
    }
  };

  instanceUpdate = (type, entityId, instanceId, { start_seconds, end_seconds }) => {
    this.props.setPlayerState({ scrubTo: null });

    const fragment = `t=${start_seconds},${end_seconds}&type=${type}`;
    const parsed_fragment = { t: [start_seconds, end_seconds] };

    switch (type) {
    case 'tag':
      retimeTag(instanceId, fragment);
      break;
    case 'clip':
      retimeClip(instanceId, fragment, parsed_fragment);
      break;
    case 'place':
      retimePlace(instanceId, fragment, parsed_fragment);
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
    case 'place':
      destroyPlace(instanceId, dbid);
      break;
    default:
      console.error(`${type} not handled`);
    }
  };

  playlistLaunch = (type) => {
    const { data, duration } = this.state;
    const { setPlayerState } = this.props;

    const entities = data[`video${type.charAt(0).toUpperCase()}${type.slice(1)}`];
    const instances = entities.reduce((acc, { instances }) =>
      [...acc, ...instances.map(({ start_seconds, end_seconds }) =>
        [start_seconds, end_seconds])], []);

    const segments = instances.sort((a, b) => a[0] - b[0])
      .reduce((ac, x) => (!ac.length || ac[ac.length - 1][1] < x[0]
        ? ac.push(x)
        : ac[ac.length - 1][1] = Math.max(ac[ac.length - 1][1], x[1]), ac), []);

    const events = [...new Set(segments.reduce((acc, [a, b]) =>
      [...acc, a, b], [-1, Number.MAX_VALUE]))].sort((a, b) => a - b);

    const gaps = events.reduce((acc, e, i) => {
      if (i % 2 === 0) return [...acc, [e]];
      const p = acc.pop();
      p.push(e);
      return [...acc, p];
    }, []).filter(([a, b]) => a !== b);

    const start = gaps.length > 0 ? Math.max(gaps[0][1], 0) : null;
    const end = gaps.length > 0 ? Math.min(gaps[gaps.length - 1][0], duration) : null;

    console.log({
      instances, segments, events, start, end, gaps,
    });

    setPlayerState({
      gaps, transport: type, start, end,
    });
  };

  timeChange = seekTo => this.props.setPlayerState({ seekTo });
  scrub = scrubTo => this.props.setPlayerState({ scrubTo });

  render() {
    const { data, duration, time } = this.state;

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
        onTimeChange={this.timeChange}
        onScrub={this.scrub}
      />
    );
  }
}

export default MediaTimeline;
