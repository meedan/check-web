import React, { Component } from 'react';
import { Timeline } from '@meedan/check-ui';

import {
  createClip, renameClip, destroyClip, retimeClip,
  createCommentThread, destroyComment, createComment, updateComment,
  createTag, renameTag, destroyTag, retimeTag,
  createPlace, createPlaceInstance, retimePlace, destroyPlace, renamePlace, repositionPlace,
} from './MediaTimelineMutations';
import { getTimelineData, intersectIntervals } from './MediaTimelineUtils';

const NOOP = () => {};

class MediaTimeline extends Component {
  commentThreadCreate = (time, text, callback) => {
    const { media: { id: mediaId, dbid } } = this.props;
    createCommentThread(text, `t=${time}`, `${dbid}`, mediaId, callback);
  };

  commentThreadDelete = (id, callback) => {
    const { media: { dbid } } = this.props;
    destroyComment(id, dbid, callback);
  };

  commentCreate = (threadId, text, callback) => {
    const { commentThreads } = getTimelineData(this.props);
    const id = commentThreads.find(({ id: id2 }) => id2 === threadId).dbid;
    createComment(text, null, `${id}`, threadId, callback);
  };

  commentEdit = (threadId, commentId, text, callback) => updateComment(commentId, text, callback);

  commentDelete = (threadId, commentId) => destroyComment(commentId, threadId);

  instanceClip = (type, entityId, instanceId) => {
    const { media: { id: mediaId, dbid } } = this.props;
    const { videoTags, videoPlaces, videoClips } = getTimelineData(this.props);

    const entity = (type === 'tag' ? videoTags : videoPlaces).find(({ id }) => id === entityId);
    const { name, instances } = entity;

    const { start_seconds, end_seconds } = instances.find(({ id }) => id === instanceId);

    const clipEntity = videoClips.find(c => c.name === name);
    const clips = clipEntity ? clipEntity.instances : [];

    const intervals = [
      ...clips.map(({ id, start_seconds: start_seconds2, end_seconds: end_seconds2 }) =>
        [start_seconds2, end_seconds2, id]), [start_seconds, end_seconds, null]];

    const segments = intersectIntervals(intervals);

    segments.forEach(([start_seconds2, end_seconds2, id]) => {
      if (id) {
        const fragment = `t=${start_seconds2},${end_seconds2}`;
        const parsed_fragment = { t: [start_seconds2, end_seconds2] };
        retimeClip(id, fragment, parsed_fragment);
      } else {
        createClip(name, `t=${start_seconds2},${end_seconds2}`, `${dbid}`, mediaId);
      }
    });

    clips.filter(({ id }) => !segments.find(s => id === s[2]))
      .forEach(({ id }) => destroyClip(id, dbid));
  };

  entityCreate = (type, payload, callback) => {
    const { media: { id: mediaId, dbid } } = this.props;

    switch (type) {
    case 'tag':
      createTag(payload[`project_${type}`].name, payload.fragment, `${dbid}`, mediaId, callback);
      break;
    case 'clip':
      createClip(payload[`project_${type}`].name, payload.fragment, `${dbid}`, mediaId, callback);
      break;
    case 'place':
      createPlace(payload[`project_${type}`].name, payload, `${dbid}`, mediaId, callback);
      break;
    default:
      NOOP();
    }
  };

  entityUpdate = (type, entityId, payload, callback) => {
    const { media: { dbid } } = this.props;
    const { videoClips, videoPlaces } = getTimelineData(this.props);

    switch (type) {
    case 'tag':
      renameTag(entityId, payload.project_tag.name, callback);
      break;
    case 'clip':
      videoClips.find(({ id }) =>
        entityId === id).instances.forEach(({ id }) =>
        renameClip(id, payload.project_clip.name, dbid));

      if (callback) callback();
      break;
    case 'place': {
      const { instances, node } = videoPlaces.find(({ id }) => entityId === id);

      if (payload.project_place) {
        instances.forEach(({ id }) =>
          renamePlace(id, payload.project_place.name, node.content, dbid));
      } else {
        instances.forEach(({ id }) =>
          repositionPlace(id, payload, node.content, dbid));
      }

      if (callback) callback();
      break;
    }
    default:
      NOOP();
    }
  };

  entityDelete = (type, entityId, callback) => {
    const { media: { dbid } } = this.props;
    const { videoTags, videoClips, videoPlaces } = getTimelineData(this.props);

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
      NOOP();
    }
  };

  instanceCreate = (type, id, payload, callback) => {
    const { media: { id: mediaId, dbid } } = this.props;
    const { videoTags, videoPlaces } = getTimelineData(this.props);

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
      NOOP();
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
      NOOP();
    }
  };

  instanceDelete = (type, entityId, instanceId) => {
    const { media: { dbid } } = this.props;

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
      NOOP();
    }
  };

  playlistLaunch = (type) => {
    const data = getTimelineData(this.props);
    const { setPlayerState, duration } = this.props;

    const entities = data[`video${type.charAt(0).toUpperCase()}${type.slice(1)}`];
    const instances = entities.reduce((acc, { instances: instances2 }) =>
      [...acc, ...instances2.map(({ start_seconds, end_seconds }) =>
        [start_seconds, end_seconds])], []);

    const segments = intersectIntervals(instances);

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

    setPlayerState({
      gaps, transport: type, start, end,
    });
  };

  timeChange = seekTo => this.props.setPlayerState({ seekTo });
  scrub = scrubTo => this.props.setPlayerState({ scrubTo });

  render() {
    const { duration, time } = this.props;
    const data = getTimelineData(this.props);

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
