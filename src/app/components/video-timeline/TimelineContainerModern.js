/* eslint-disable */
import React, { Component } from 'react';
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import qs from 'qs';
import { Timeline } from '@meedan/check-ui';

import environment from '../../CheckNetworkLayerModern';

const NOOP = () => {};

const createTag = (tag, fragment, annotated_id, callback, retry) => {
  return commitMutation(environment, {
    mutation: graphql`
      mutation TimelineContainerModernCreateInstanceMutation($input: CreateTagInput!) {
        createTag(input: $input) {
          tagEdge {
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
    `,
    variables: {
      input: { tag, fragment, annotated_id, clientMutationId: `m${Date.now()}`, annotated_type: 'ProjectMedia' },
    },
    onCompleted: (data, errors) => {
      console.log({ data, errors });
      callback && callback(data, errors);
      retry(); // FIXME
    },
    // configs: [
    //   {
    //     type: 'RANGE_ADD',
    //     parentName: 'project_media',
    //     parentID: annotated_id,
    //     edgeName: 'tagEdge',
    //     connectionName: 'tags',
    //     rangeBehaviors: () => 'prepend',
    //   },
    // ],
  });
};

const retime = (id, fragment) => {
  return commitMutation(environment, {
    mutation: graphql`
      mutation TimelineContainerModernFragmentMutation($input: UpdateTagInput!) {
        updateTag(input: $input) {
          tag {
            id
            fragment
          }
        }
      }
    `,
    variables: {
      input: { id, fragment, clientMutationId: `m${Date.now()}` },
    },
    optimisticResponse: {
      updateTag: {
        tag: {
          id,
          fragment,
        },
      },
    },
  });
};

const rename = (id, text) => {
  return commitMutation(environment, {
    mutation: graphql`
      mutation TimelineContainerModernTextMutation($input: UpdateTagTextInput!) {
        updateTagText(input: $input) {
          tag_text {
            id
            text
          }
        }
      }
    `,
    variables: {
      input: { id, text, clientMutationId: `m${Date.now()}` },
    },
    optimisticResponse: {
      updateTagText: {
        tag_text: {
          id,
          text,
        },
      },
    },
  });
};

const destroy = (id, annotated_id) => {
  return commitMutation(environment, {
    mutation: graphql`
      mutation TimelineContainerModernDestroyMutation($input: DestroyTagTextInput!) {
        destroyTagText(input: $input) {
          deletedId
        }
      }
    `,
    variables: {
      input: { id, clientMutationId: `m${Date.now()}` },
    },
    configs: [
      {
        type: 'NODE_DELETE',
        parentName: 'project_media',
        parentID: annotated_id,
        connectionName: 'tags',
        deletedIDFieldName: 'deletedId',
      },
    ],
  });
};

const TEST = () => {
  return commitMutation(environment, {
    mutation: graphql`
      mutation TimelineContainerModernTESTMutation {
        createRelationship(input: {
          source_id: 2,
          target_id: 3,
          relationship_type: "{\"source\":\"full_video\",\"target\":\"clip\"}"
        }) {
          relationship {
            dbid
          }
        }
      }
    `,
    variables: {},
  });
};

window.TEST = TEST;

const TimelineContainer = ({ time, duration, params: { mediaId, projectId } }) => (
  <QueryRenderer
    environment={environment}
    query={graphql`
      query TimelineContainerModernQuery($ids: String!) {
        project_media(ids: $ids) {
          tags(first: 10000) {
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
    variables={{ ids: `${mediaId},${projectId}` }}
    render={({ error, props, retry }) => {
      console.log({ error, props });

      if (!error && props) {
        const {
          project_media: {
            tags: { edges = [] },
          },
        } = props;

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

        console.log({ projecttags, entities });

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

        console.log({ data });

        return (
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
            onEntityCreate={(type, payload, callback) => createTag(payload[`project_${type}`].name, payload.fragment, mediaId, callback, retry)}
            onEntityDelete={NOOP}
            onEntityUpdate={NOOP}
            onInstanceClip={NOOP}
            onInstanceCreate={(type, id, payload, callback) => createTag(data.videoTags.find(({ id: _id }) => _id === id).name, payload.fragment, mediaId, callback, retry)}
            onInstanceDelete={(type, entityId, instanceId) => destroy(instanceId, mediaId)}
            onInstanceUpdate={(type, entityId, instanceId, { start_seconds, end_seconds }) => retime(instanceId, `t=${start_seconds},${end_seconds}&type=${type}`)}
            onPlaylistLaunch={NOOP}
            onTimeChange={NOOP}
          />
        );
      } else if (!error) {
        return <p>loading…</p>;
      }

      return <p>Error!</p>;
    }}
  />
);

export default TimelineContainer;

