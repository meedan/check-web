/* eslint-disable */
import { QueryRenderer, graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';

const environment = Store;

const NOOP = () => {};

const createComment = (text, fragment, annotated_id, parentID, callback) => {
  return commitMutation(environment, {
    mutation: graphql`
      mutation VideoTimelineUtilsCreateCommentMutation($input: CreateCommentInput!) {
        createComment(input: $input) {
          comment {
            dbid
          }
        }
      }
    `,
    variables: {
      input: { annotated_id, text, fragment, clientMutationId: `m${Date.now()}`, annotated_type: 'ProjectMedia'},
    },
    // configs: [
    //   {
    //     type: 'RANGE_ADD',
    //     parentName: 'project_media',
    //     parentID,
    //     edgeName: 'tagEdge',
    //     connectionName: 'tags',
    //     rangeBehaviors: () => ('prepend'),
    //     connectionInfo: [{
    //       key: 'ProjectMedia_tags',
    //       rangeBehavior: 'prepend',
    //     }],
    //   },
    // ],
    onCompleted: (data, errors) => callback && callback(data, errors),
  });
};

const createTag = (tag, fragment, annotated_id, parentID, callback) => {
  return commitMutation(environment, {
    mutation: graphql`
      mutation VideoTimelineUtilsCreateInstanceMutation($input: CreateTagInput!) {
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
      input: { tag, fragment, annotated_id, clientMutationId: `m${Date.now()}`, annotated_type: 'ProjectMedia' },
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
};

const retimeTag = (id, fragment) => {
  return commitMutation(environment, {
    mutation: graphql`
      mutation VideoTimelineUtilsFragmentMutation($input: UpdateTagInput!) {
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

const renameTag = (id, text, callback) => {
  return commitMutation(environment, {
    mutation: graphql`
      mutation VideoTimelineUtilsTextMutation($input: UpdateTagTextInput!) {
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
};

const destroyTag = (id, annotated_id) => {
  return commitMutation(environment, {
    mutation: graphql`
      mutation VideoTimelineUtilsDestroyMutation($input: DestroyTagTextInput!) {
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

export const entityCreate = (type, payload, mediaId, parentId, callback) => {
  switch (type) {
    case 'tag':
      createTag(payload[`project_${type}`].name, payload.fragment, mediaId, parentId, callback);
      break;
    default:
      console.error(`${type} not handled`);
  }
};

export const entityUpdate = (type, entityId, payload, callback) => {
  switch (type) {
    case 'tag':
      renameTag(entityId, payload.project_tag.name, callback);
      break;
    default:
      console.error(`${type} not handled`);
  }
};

export const entityDelete = (type, entityId, tags, mediaId, callback) => {
  switch (type) {
    case 'tag':
      tags.forEach(({ id }) => destroyTag(id, mediaId));
      callback && callback();
      break;
    default:
      console.error(`${type} not handled`);
  }
};

export const instanceCreate = (type, id, name, payload, mediaId, parentId, callback) => {
  switch (type) {
    case 'tag':
      createTag(name, payload.fragment, mediaId, parentId, callback);
      break;
    default:
      console.error(`${type} not handled`);
  }
};

export const instanceUpdate = (type, entityId, instanceId, fragment) => {
  switch (type) {
    case 'tag':
      retimeTag(instanceId, fragment);
      break;
    default:
      console.error(`${type} not handled`);
  }
};

export const instanceDelete = (type, instanceId, mediaId) => {
  switch (type) {
    case 'tag':
      destroyTag(instanceId, mediaId);
      break;
    default:
      console.error(`${type} not handled`);
  }
};

export const instanceClip = (type, entityId, instanceId) => {
  switch (type) {
    case 'tag':
      console.warn('TODO instance -> clip');
      break;
    default:
      console.error(`${type} not handled`);
  }
};

export const playlistLaunch = (type, data) => {
  switch (type) {
    case 'tags':
      console.warn('TODO playlist tags');
      break;
    default:
      console.error(`${type} not handled`);
  }
};

// createComment = (text, fragment, annotated_id, parentID, callback)
export const commentThreadCreate = (time, text, mediaId, callback) => {
  createComment(text, `t=${time}`, mediaId, null, callback);
};