import React from 'react';
import xor from 'lodash.xor';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { createRefetchContainer, graphql, commitMutation } from 'react-relay/compat';
import { browserHistory } from 'react-router';
import mergeWith from 'lodash.mergewith';
import { can } from '../Can';
import { searchQueryFromUrl, urlFromSearchQuery } from '../search/Search';
import TagList from '../cds/menus-lists-dialogs/TagList';
import { FlashMessageSetterContext } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessage } from '../../helpers';

const pageSize = 100;
let lastTypedValue = '';

const MediaTags = ({
  projectMedia,
  relay,
}) => {
  if (!projectMedia) return null;

  const refetch = (keyword) => {
    relay.refetch(
      { ids: `${projectMedia.dbid},,`, pageSize, keyword: keyword || '' },
      { ids: `${projectMedia.dbid},,`, pageSize, keyword: '' },
      () => {},
      { force: true },
    );
  };

  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const searchTagUrl = (tagString) => {
    const tagQuery = {
      tags: [tagString],
    };
    const searchQuery = searchQueryFromUrl();

    // Make a new query combining the current tag with whatever query is already in the URL.
    // This allows to support clicking tags on the search and project pages.
    const query = mergeWith({}, searchQuery, tagQuery, (objValue, srcValue) => {
      if (Array.isArray(objValue)) {
        return xor(objValue, srcValue);
      }
      return undefined;
    });
    if (!query.tags.length) {
      delete query.tags;
    }
    return urlFromSearchQuery(query, `/${projectMedia.team.slug}/all-items`);
  };

  const handleTagViewClick = (tagString) => {
    const url = searchTagUrl(tagString);
    if (window !== window.parent) { // Browser extension
      window.open(`${window.location.origin}${url}`);
    } else {
      browserHistory.push(url);
    }
  };

  const readOnly = !can(projectMedia.permissions, 'update ProjectMedia');

  const onFailure = (transaction) => {
    const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
    setFlashMessage(message);
  };

  const handleCreateTag = (value) => {
    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation MediaTagsCreateTagMutation($input: CreateTagInput!, $pageSize: Int!, $keyword: String) {
          createTag(input: $input) {
            project_media {
              ...MediaTags_projectMedia @arguments(pageSize: $pageSize, keyword: $keyword)
            }
          }
        }
      `,
      variables: {
        input: {
          annotated_id: projectMedia.dbid.toString(),
          annotated_type: 'ProjectMedia',
          tag: value,
        },
        pageSize,
        keyword: '',
      },
      onCompleted: ({ error }) => {
        if (error) {
          onFailure(error);
        } else {
          refetch();
        }
      },
      onError: onFailure,
    });
  };

  const handleRemoveTag = (value) => {
    const removedTag = projectMedia.tags.edges.find(tag => tag.node.tag_text === value);
    if (removedTag) {
      commitMutation(Relay.Store, {
        mutation: graphql`
          mutation MediaTagsDeleteTagMutation($input: DestroyTagInput!) {
            destroyTag(input: $input) {
              project_media {
                tags(first: 100) {
                  edges {
                    node {
                      tag_text
                    }
                  }
                }
              }
            }
          }
        `,
        variables: {
          input: {
            id: removedTag.node.id,
          },
        },
        onCompleted: ({ error }) => {
          if (error) {
            onFailure(error);
          }
        },
        onError: onFailure,
      });
    }
  };

  const handleSetTags = (value) => {
    const tagTexts = projectMedia.tags.edges.map(t => t.node.tag_text);
    tagTexts.forEach((text) => {
      if (!value.includes(text)) handleRemoveTag(text);
    });
    value.forEach((val) => {
      if (!tagTexts.includes(val)) handleCreateTag(val);
    });
  };

  const selected = projectMedia.tags.edges.map(t => t.node.tag_text);
  const options = projectMedia.team.tag_texts.edges.map(tt => ({ label: tt.node.text, value: tt.node.text }));

  console.log('options', options); // eslint-disable-line no-console


  const handleType = (keyword) => {
    lastTypedValue = keyword;
    setTimeout(() => {
      if (keyword === lastTypedValue) {
        refetch(keyword);
      }
    }, 1500);
  };

  return (
    <TagList
      options={options}
      readOnly={readOnly}
      setSearchTerm={handleType}
      setTags={handleSetTags}
      tags={selected}
      onClickTag={handleTagViewClick}
    />
  );
};

MediaTags.defaultProps = {
  projectMedia: {
    tags: {
      edges: [],
    },
    team: {
      tag_texts: {
        edges: [],
      },
    },
  },
};

MediaTags.propTypes = {
  projectMedia: PropTypes.shape({
    dbid: PropTypes.number,
    team: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }).isRequired,
    suggested_main_item: PropTypes.shape({
      dbid: PropTypes.number,
    }),
    is_secondary: PropTypes.bool,
    tags: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          id: PropTypes.string.isRequired,
          tag_text: PropTypes.string.isRequired,
        }),
      }).isRequired).isRequired,
    }).isRequired,
  }),
};

export { MediaTags }; // eslint-disable-line import/no-unused-modules

export default createRefetchContainer(MediaTags,
  {
    projectMedia: graphql`
      fragment MediaTags_projectMedia on ProjectMedia
      @argumentDefinitions(keyword: {type: "String", defaultValue: ""}, pageSize: {type: "Int!", defaultValue: 100}) {
        dbid
        permissions
        team {
          slug
          tag_texts(first: $pageSize, keyword: $keyword) {
            edges {
              node {
                text
              }
            }
          }
        }
        tags(last: $pageSize) {
          edges {
            node {
              id
              tag_text
            }
          }
        }
      }
    `,
  },
  {
    projectMedia: graphql`
      query MediaTagsRefetchQuery($ids: String!, $pageSize: Int!, $keyword: String) {
        project_media(ids: $ids) {
          ...MediaTags_projectMedia @arguments(pageSize: $pageSize, keyword: $keyword)
        }
      }
    `,
  },
);
