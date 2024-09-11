import React from 'react';
import xor from 'lodash.xor';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { createFragmentContainer, graphql, commitMutation } from 'react-relay/compat';
import { browserHistory } from 'react-router';
import mergeWith from 'lodash.mergewith';
import { can } from '../Can';
import { searchQueryFromUrl, urlFromSearchQuery } from '../search/Search';
import TagList from '../cds/menus-lists-dialogs/TagList';
import { FlashMessageSetterContext } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessage } from '../../helpers';

const MediaTags = ({ projectMedia }) => {
  if (!projectMedia) return null;

  const readOnly = !can(projectMedia.permissions, 'update ProjectMedia');

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

  const onFailure = (transaction) => {
    const message = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
    setFlashMessage(message);
  };

  const handleCreateTag = (value) => {
    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation MediaTagsCreateTagMutation($input: CreateTagInput!) {
          createTag(input: $input) {
            project_media {
              ...MediaTags_projectMedia
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
      },
      onCompleted: ({ error }) => {
        if (error) {
          onFailure(error);
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
                ...MediaTags_projectMedia
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

  return (
    <TagList
      readOnly={readOnly}
      setTags={handleSetTags}
      tags={selected}
      teamSlug={projectMedia.team.slug}
      onClickTag={handleTagViewClick}
    />
  );
};

MediaTags.defaultProps = {
  projectMedia: null,
};

MediaTags.propTypes = {
  projectMedia: PropTypes.shape({
    dbid: PropTypes.number,
    team: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }).isRequired,
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

export default createFragmentContainer(MediaTags,
  graphql`
    fragment MediaTags_projectMedia on ProjectMedia {
      dbid
      permissions
      team {
        slug
      }
      tags(last: 100) {
        edges {
          node {
            id
            tag_text
          }
        }
      }
    }
  `,
);
