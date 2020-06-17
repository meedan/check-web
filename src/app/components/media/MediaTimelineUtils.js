/* eslint-disable no-console */
/* eslint-disable no-shadow */
/* eslint-disable max-len */
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';

const environment = Store;

export const repositionPlace = (id, payload, content) => {
  const fields = JSON.parse(content);

  const {
    geolocation_viewport,
    geolocation_location,
  } = fields.reduce((acc, field) =>
    ({ ...acc, [field.field_name]: field }), {});

  const { value_json: { properties: { name } } } = geolocation_location;

  const {
    type, polygon,
    lat = 0, lng = 0,
    viewport, zoom = 10,
  } = payload;

  const {
    west, south, east, north,
  } = viewport;

  const geojson = {
    type: 'Feature',
    bbox: [west, south, east, north],
    geometry: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    properties: { name },
  };

  if (type === 'polygon') {
    geojson.geometry = {
      type: 'Polygon',
      coordinates: [polygon.map(({ lat, lng }) => [lng, lat])],
    };
  }

  geolocation_viewport.value_json = { viewport, zoom };
  geolocation_location.value_json = geojson;

  console.log(`http://geojson.io/#data=data:application/json,${encodeURIComponent(JSON.stringify(geojson))}`);

  return commitMutation(environment, {
    mutation: graphql`
      mutation MediaTimelineUtilsRepositionPlaceMutation($input: UpdateDynamicInput!) {
        updateDynamic(input: $input) {
          dynamic {
            id,
            content,
            parsed_fragment
          }
        }
      }
    `,
    variables: {
      input: {
        id,
        set_fields: JSON.stringify({
          geolocation_viewport: { viewport, zoom },
          geolocation_location: JSON.stringify(geojson),
        }),
        clientMutationId: `m${Date.now()}`,
      },
    },
    optimisticResponse: {
      updateDynamic: {
        dynamic: {
          id,
          content: JSON.stringify([geolocation_viewport, geolocation_location]),
        },
      },
    },
  });
}; 

export const renamePlace = (id, label, content) => {
  const fields = JSON.parse(content);
  const {
    geolocation_viewport: { viewport, zoom },
    geolocation_location: geojson,
  } = fields.reduce((acc, { field_name, value_json }) =>
    ({ ...acc, [field_name]: value_json }), {});

  geojson.properties.name = label;

  const index = fields.findIndex(({ field_name }) => field_name === 'geolocation_location');
  fields[index].value_json = geojson;

  return commitMutation(environment, {
    mutation: graphql`
      mutation MediaTimelineUtilsRenamePlaceMutation($input: UpdateDynamicInput!) {
        updateDynamic(input: $input) {
          dynamic {
            id,
            content,
            parsed_fragment
          }
        }
      }
    `,
    variables: {
      input: {
        id,
        set_fields: JSON.stringify({
          geolocation_viewport: { viewport, zoom },
          geolocation_location: JSON.stringify(geojson),
        }),
        clientMutationId: `m${Date.now()}`,
      },
    },
    optimisticResponse: {
      updateDynamic: {
        dynamic: {
          id,
          content: JSON.stringify(fields),
        },
      },
    },
  });
};

export const destroyPlace = (id, annotated_id) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineUtilsDestroyPlaceMutation($input: DestroyDynamicInput!) {
      destroyDynamic(input: $input) {
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
      connectionName: 'geolocations',
      deletedIDFieldName: 'deletedId',
    },
  ],
});

export const retimePlace = (id, fragment, parsed_fragment) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineUtilsRetimePlaceMutation($input: UpdateDynamicInput!) {
      updateDynamic(input: $input) {
        dynamic {
          id,
          parsed_fragment
        }
      }
    }
  `,
  variables: {
    input: {
      id,
      fragment,
      clientMutationId: `m${Date.now()}`,
    },
  },
  optimisticResponse: {
    updateDynamic: {
      dynamic: {
        id,
        parsed_fragment,
      },
    },
  },
});

export const createPlaceInstance = (name, { fragment }, content, annotated_id, parentID, callback) => {
  const {
    geolocation_viewport: { viewport, zoom },
    geolocation_location: geojson,
  } = content.reduce((acc, { field_name, value_json }) =>
    ({ ...acc, [field_name]: value_json }), {});

  console.log({
    name, fragment, viewport, zoom, geojson, annotated_id, parentID,
  });

  console.log(`http://geojson.io/#data=data:application/json,${encodeURIComponent(JSON.stringify(geojson))}`);

  return commitMutation(environment, {
    mutation: graphql`
      mutation MediaTimelineUtilsCreatePlaceInstanceMutation($input: CreateDynamicAnnotationGeolocationInput!) {
        createDynamicAnnotationGeolocation(input: $input) {
          dynamicEdge {
            node {
              id
              dbid
              parsed_fragment
              content
            }
          }
        }
      }
    `,
    variables: {
      input: {
        fragment,
        annotated_id,
        set_fields: JSON.stringify({
          geolocation_viewport: { viewport, zoom },
          geolocation_location: JSON.stringify(geojson),
        }),
        clientMutationId: `m${Date.now()}`,
        annotated_type: 'ProjectMedia',
      },
    },
    configs: [
      {
        type: 'RANGE_ADD',
        parentName: 'project_media',
        parentID,
        edgeName: 'dynamicEdge',
        connectionName: 'annotations',
        rangeBehaviors: (args) => {
          if (args.annotation_type === 'geolocation') {
            return 'prepend';
          }
          return 'ignore';
        },
        connectionInfo: [{
          key: 'ProjectMedia_geolocations',
          rangeBehavior: 'prepend',
          filters: { annotation_type: 'geolocation' },
        }],
      },
    ],
    onCompleted: (data, errors) => callback && callback(data, errors),
  });
};

export const createPlace = (name, payload, annotated_id, parentID, callback) => {
  const {
    fragment, type, polygon,
    lat = 0, lng = 0,
    viewport, zoom = 10,
  } = payload;

  const {
    west, south, east, north,
  } = viewport;

  const geojson = {
    type: 'Feature',
    bbox: [west, south, east, north],
    geometry: {
      type: 'Point',
      coordinates: [lng, lat],
    },
    properties: { name },
  };

  if (type === 'polygon') {
    geojson.geometry = {
      type: 'Polygon',
      coordinates: [polygon.map(({ lat, lng }) => [lng, lat])],
    };
  }

  console.log(`http://geojson.io/#data=data:application/json,${encodeURIComponent(JSON.stringify(geojson))}`);

  return commitMutation(environment, {
    mutation: graphql`
      mutation MediaTimelineUtilsCreatePlaceMutation($input: CreateDynamicAnnotationGeolocationInput!) {
        createDynamicAnnotationGeolocation(input: $input) {
          dynamicEdge {
            node {
              id
              dbid
              parsed_fragment
              content
            }
          }
        }
      }
    `,
    variables: {
      input: {
        fragment,
        annotated_id,
        set_fields: JSON.stringify({
          geolocation_viewport: { viewport, zoom },
          geolocation_location: JSON.stringify(geojson),
        }),
        clientMutationId: `m${Date.now()}`,
        annotated_type: 'ProjectMedia',
      },
    },
    configs: [
      {
        type: 'RANGE_ADD',
        parentName: 'project_media',
        parentID,
        edgeName: 'dynamicEdge',
        connectionName: 'annotations',
        rangeBehaviors: (args) => {
          if (args.annotation_type === 'geolocation') {
            return 'prepend';
          }
          return 'ignore';
        },
        connectionInfo: [{
          key: 'ProjectMedia_geolocations',
          rangeBehavior: 'prepend',
          filters: { annotation_type: 'geolocation' },
        }],
      },
    ],
    onCompleted: (data, errors) => callback && callback(data, errors),
  });
};

export const createClip = (label, fragment, annotated_id, parentID, callback) =>
  commitMutation(environment, {
    mutation: graphql`
      mutation MediaTimelineUtilsCreateClipMutation($input: CreateDynamicInput!) {
        createDynamic(input: $input) {
          dynamicEdge {
            node {
              id,
              data,
              parsed_fragment
            }
          }
        }
      }
    `,
    variables: {
      input: {
        fragment,
        annotated_id,
        set_fields: JSON.stringify({ label }),
        clientMutationId: `m${Date.now()}`,
        annotation_type: 'clip',
        annotated_type: 'ProjectMedia',
      },
    },
    configs: [
      {
        type: 'RANGE_ADD',
        parentName: 'project_media',
        parentID,
        edgeName: 'dynamicEdge',
        connectionName: 'annotations',
        rangeBehaviors: (args) => {
          if (args.annotation_type === 'clip') {
            return 'prepend';
          }
          return 'ignore';
        },
        connectionInfo: [{
          key: 'ProjectMedia_clips',
          rangeBehavior: 'prepend',
          filters: { annotation_type: 'clip' },
        }],
      },
    ],
    onCompleted: (data, errors) => callback && callback(data, errors),
  });

export const renameClip = (id, label) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineUtilsRenameClipMutation($input: UpdateDynamicInput!) {
      updateDynamic(input: $input) {
        dynamic {
          id,
          data,
          parsed_fragment
        }
      }
    }
  `,
  variables: {
    input: {
      id,
      set_fields: JSON.stringify({ label }),
      clientMutationId: `m${Date.now()}`,
    },
  },
  optimisticResponse: {
    updateDynamic: {
      dynamic: {
        id,
        data: { label },
      },
    },
  },
});

export const retimeClip = (id, fragment, parsed_fragment) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineUtilsRetimeClipMutation($input: UpdateDynamicInput!) {
      updateDynamic(input: $input) {
        dynamic {
          id,
          data,
          parsed_fragment
        }
      }
    }
  `,
  variables: {
    input: {
      id,
      fragment,
      clientMutationId: `m${Date.now()}`,
    },
  },
  optimisticResponse: {
    updateDynamic: {
      dynamic: {
        id,
        fragment,
        parsed_fragment,
      },
    },
  },
});

export const destroyClip = (id, annotated_id) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineUtilsDestroyClipMutation($input: DestroyDynamicInput!) {
      destroyDynamic(input: $input) {
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
      connectionName: 'clips',
      deletedIDFieldName: 'deletedId',
    },
  ],
});

export const updateComment = (id, text, callback) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineUtilsUpdateCommentMutation($input: UpdateCommentInput!) {
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

export const destroyComment = (id, annotated_id, callback) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineUtilsDestroyCommentMutation($input: DestroyCommentInput!) {
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

export const createComment =
  (text, fragment, annotated_id, parentID, callback) => {
    console.log({
      text, fragment, annotated_id, parentID, callback,
    });
    return commitMutation(environment, {
      mutation: graphql`
        mutation MediaTimelineUtilsCreateCommentMutation($input: CreateCommentInput!) {
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

export const createCommentThread =
  (text, fragment, annotated_id, parentID, callback) => {
    console.log({
      text, fragment, annotated_id, parentID, callback,
    });
    return commitMutation(environment, {
      mutation: graphql`
        mutation MediaTimelineUtilsCreateCommentThreadMutation($input: CreateCommentInput!) {
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
          rangeBehaviors: (args) => {
            if (args.annotation_type === 'comment') {
              return 'append';
            }
            return 'ignore';
          },
          connectionInfo: [{
            key: 'ProjectMedia_comments',
            rangeBehavior: 'append',
          }],
        },
      ],
      onCompleted: (data, errors) => callback && callback(data, errors),
    });
  };

export const createTag = (tag, fragment, annotated_id, parentID, callback) =>
  commitMutation(environment, {
    mutation: graphql`
      mutation MediaTimelineUtilsCreateInstanceMutation($input: CreateTagInput!) {
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

export const retimeTag = (id, fragment) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineUtilsFragmentMutation($input: UpdateTagInput!) {
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

export const renameTag = (id, text, callback) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineUtilsTextMutation($input: UpdateTagTextInput!) {
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

export const destroyTag = (id, annotated_id) => commitMutation(environment, {
  mutation: graphql`
    mutation MediaTimelineUtilsDestroyMutation($input: DestroyTagTextInput!) {
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
