/* eslint-disable no-shadow */
import React, { Component } from 'react';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { Timeline } from '@meedan/check-ui';
import qs from 'qs';

const environment = Store;

const updateComment = (id, text, callback) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineUpdateCommentMutation($input: UpdateCommentInput!) {
      updateComment(input: $input) {
        comment {
          id
          dbid
          text
        }
      }
    }
  `,
  variables: {
    input: { id, text, clientMutationId: `m${Date.now()}` },
  },
  optimisticResponse: {
    updateComment: {
      comment: {
        id,
        text,
      },
    },
  },
  onCompleted: (data, errors) => callback && callback(data, errors),
});

const destroyComment = (id, annotated_id, callback) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineDestroyCommentMutation($input: DestroyCommentInput!) {
      destroyComment(input: $input) {
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
      connectionName: 'comments',
      deletedIDFieldName: 'deletedId',
    },
  ],
  onCompleted: (data, errors) => callback && callback(data, errors),
});

const createComment =
  (text, fragment, annotated_id, parentID, callback) => {
    console.log({
      text, fragment, annotated_id, parentID, callback,
    });
    return commitMutation(environment, {
      mutation: graphql`
        mutation MediaTimelineCreateCommentMutation($input: CreateCommentInput!) {
          createComment(input: $input) {
            commentEdge {
              cursor
              __typename
              node {
                id
                text
                dbid
                annotator {
                  id
                  name
                  profile_image
                }
                text
                parsed_fragment
              }
            }
          }
        }
      `,
      variables: {
        input: {
          annotated_id, text, fragment, clientMutationId: `m${Date.now()}`, annotated_type: 'Comment',
        },
      },
      configs: [
        {
          type: 'RANGE_ADD',
          parentName: 'Comment',
          parentID,
          edgeName: 'commentEdge',
          connectionName: 'annotations',
          rangeBehaviors: () => ('append'),
          connectionInfo: [{
            key: 'Comment_comments',
            rangeBehavior: 'append',
          }],
        },
      ],
      onCompleted: (data, errors) => callback && callback(data, errors),
    });
  };

const createCommentThread =
  (text, fragment, annotated_id, parentID, callback) => {
    console.log({
      text, fragment, annotated_id, parentID, callback,
    });
    return commitMutation(environment, {
      mutation: graphql`
        mutation MediaTimelineCreateCommentThreadMutation($input: CreateCommentInput!) {
          createComment(input: $input) {
            commentEdge {
              cursor
              __typename
              node {
                id
                text
                dbid
                annotator {
                  id
                  name
                  profile_image
                }
                text
                parsed_fragment
                comments: annotations(first: 10000, annotation_type: "comment") {
                  edges {
                    node {
                      ... on Comment {
                        id
                        created_at
                        text
                        annotator {
                          id
                          name
                          profile_image
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        input: {
          annotated_id, text, fragment, clientMutationId: `m${Date.now()}`, annotated_type: 'ProjectMedia',
        },
      },
      configs: [
        {
          type: 'RANGE_ADD',
          parentName: 'project_media',
          parentID,
          edgeName: 'commentEdge',
          connectionName: 'annotations',
          rangeBehaviors: () => ('append'),
          connectionInfo: [{
            key: 'ProjectMedia_comments',
            rangeBehavior: 'append',
          }],
        },
      ],
      onCompleted: (data, errors) => callback && callback(data, errors),
    });
  };

const createTag = (tag, fragment, annotated_id, parentID, callback) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineCreateInstanceMutation($input: CreateTagInput!) {
      createTag(input: $input) {
        project_media {
          id
        }
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
    input: {
      tag, fragment, annotated_id, clientMutationId: `m${Date.now()}`, annotated_type: 'ProjectMedia',
    },
  },
  configs: [
    {
      type: 'RANGE_ADD',
      parentName: 'project_media',
      parentID,
      edgeName: 'tagEdge',
      connectionName: 'tags',
      rangeBehaviors: () => ('prepend'),
      connectionInfo: [{
        key: 'ProjectMedia_tags',
        rangeBehavior: 'prepend',
      }],
    },
  ],
  onCompleted: (data, errors) => callback && callback(data, errors),
});

const retimeTag = (id, fragment) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineFragmentMutation($input: UpdateTagInput!) {
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

const renameTag = (id, text, callback) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineTextMutation($input: UpdateTagTextInput!) {
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
  onCompleted: (data, errors) => callback && callback(data, errors),
  optimisticResponse: {
    updateTagText: {
      tag_text: {
        id,
        text,
      },
    },
  },
});

const destroyTag = (id, annotated_id) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineDestroyMutation($input: DestroyTagTextInput!) {
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

const entityCreate = (type, payload, mediaId, parentId, callback) => {
  switch (type) {
  case 'tag':
    createTag(payload[`project_${type}`].name, payload.fragment, `${mediaId}`, parentId, callback);
    break;
  default:
    console.error(`${type} not handled`);
  }
};

const entityUpdate = (type, entityId, payload, callback) => {
  switch (type) {
  case 'tag':
    renameTag(entityId, payload.project_tag.name, callback);
    break;
  default:
    console.error(`${type} not handled`);
  }
};

const entityDelete = (type, entityId, tags, mediaId, callback) => {
  switch (type) {
  case 'tag':
    tags.forEach(({ id }) => destroyTag(id, mediaId));
    if (callback) callback();
    break;
  default:
    console.error(`${type} not handled`);
  }
};

const instanceCreate = (type, id, name, payload, mediaId, parentId, callback) => {
  switch (type) {
  case 'tag':
    createTag(name, payload.fragment, `${mediaId}`, parentId, callback);
    break;
  default:
    console.error(`${type} not handled`);
  }
};

const instanceUpdate = (type, entityId, instanceId, fragment) => {
  switch (type) {
  case 'tag':
    retimeTag(instanceId, fragment);
    break;
  default:
    console.error(`${type} not handled`);
  }
};

const instanceDelete = (type, instanceId, mediaId) => {
  switch (type) {
  case 'tag':
    destroyTag(instanceId, mediaId);
    break;
  default:
    console.error(`${type} not handled`);
  }
};

const instanceClip = (type, entityId, instanceId) => {
  switch (type) {
  case 'tag':
    console.warn(`TODO instance ${instanceId} -> clip`);
    break;
  default:
    console.error(`${type} not handled`);
  }
};

const playlistLaunch = (type, data) => {
  switch (type) {
  case 'tags':
    console.warn('TODO playlist tags', data);
    break;
  default:
    console.error(`${type} not handled`);
  }
};

const commentThreadCreate = (time, text, mediaId, parentID, callback) => {
  createCommentThread(text, `t=${time}`, `${mediaId}`, parentID, callback);
};

const commentThreadDelete = (id, annotated_id, callback) => {
  destroyComment(id, annotated_id, callback);
};

const commentCreate = (id, text, parentID, callback) => {
  console.log({
    id, text, parentID, callback,
  });
  createComment(text, null, `${id}`, parentID, callback);
};

const commentEdit = (threadId, commentId, text, callback) => {
  console.log({
    threadId, commentId, text, callback,
  });
  updateComment(commentId, text, callback);
};

const commentDelete = (threadId, commentId) => {
  destroyComment(commentId, threadId);
};

class MediaTimeline extends Component {
  render() {
    const {
      media: {
        id: mediaId, dbid,
        tags: { edges = [] },
        comments,
      },
      duration, time, setPlayerState,
      currentUser: { name: first_name, id: userId, profile_image: profile_img_url },
    } = this.props;

    const projecttags = [];
    const entities = {};

    edges
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

    const commentThreads = comments.edges.map(({
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

    const data = {
      commentThreads,
      project: {
        projectclips: [],
        projectplaces: [],
        projecttags,
      },
      videoClips: [],
      videoPlaces: [],
      videoTags: Object.values(entities).filter(({ type }) => type === 'tag' || type === 'tags'),
      user: {
        first_name,
        id: userId,
        last_name: '',
        profile_img_url,
      },
    };

    return (
      <Timeline
        currentTime={time}
        data={data}
        duration={duration}
        onBeforeCommentThreadCreate={(a, b, c, d, e) => console.log(a, b, c, d, e)}
        onCommentCreate={(threadId, text, callback) =>
          commentCreate(commentThreads.find(({ id }) =>
            id === threadId).dbid, text, threadId, callback)}
        onCommentDelete={(threadId, commentId) => commentDelete(threadId, commentId)}
        onCommentEdit={(threadId, commentId, text, callback) =>
          commentEdit(threadId, commentId, text, callback)}
        onCommentThreadCreate={
          (t, text, callback) => commentThreadCreate(t, text, dbid, mediaId, callback)
        }
        onCommentThreadDelete={(id, callback) => commentThreadDelete(id, mediaId, callback)}
        onEntityCreate={
          (type, payload, callback) => entityCreate(type, payload, dbid, mediaId, callback)
        }
        onEntityDelete={
          (type, entityId, callback) =>
            entityDelete(type, entityId, data.videoTags.find(({ id }) =>
              entityId === id).instances, dbid, callback)
        }
        onEntityUpdate={
          (type, entityId, payload, callback) => entityUpdate(type, entityId, payload, callback)
        }
        onInstanceClip={(type, entityId, instanceId) => instanceClip(type, entityId, instanceId)}
        onInstanceCreate={
          (type, id, payload, callback) =>
            instanceCreate(type, id, data.videoTags.find(({ id: _id }) =>
              _id === id).name, payload, dbid, mediaId, callback)
        }
        onInstanceDelete={(type, entityId, instanceId) => instanceDelete(type, instanceId, dbid)}
        onInstanceUpdate={(type, entityId, instanceId, { start_seconds, end_seconds }) => instanceUpdate(type, entityId, instanceId, `t=${start_seconds},${end_seconds}&type=${type}`)}
        onPlaylistLaunch={type => playlistLaunch(type, data)}
        onTimeChange={seekTo => setPlayerState({ seekTo })}
      />
    );
  }
}

export default MediaTimeline;
