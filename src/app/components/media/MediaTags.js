import React from 'react';
import xor from 'lodash.xor';
import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import { browserHistory } from 'react-router';
import mergeWith from 'lodash.mergewith';
import CheckArchivedFlags from '../../CheckArchivedFlags';
import { can } from '../Can';
import { searchQueryFromUrl, urlFromSearchQuery } from '../search/Search';
import TagList from '../cds/menus-lists-dialogs/TagList';

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */
const MediaTagsComponent = ({ projectMedia }) => {
  const filterTags = memoize((tags) => {
    const splitTags = {
      regularTags: [],
      videoTags: [],
    };
    const fragments = {};
    // Get regular tags and cluster video tags by tag_text
    if (Array.isArray(tags)) {
      tags.forEach((t) => {
        if (t.node.fragment) {
          if (!fragments[t.node.tag_text]) {
            fragments[t.node.tag_text] = [];
          }
          fragments[t.node.tag_text].push(t);
        } else {
          splitTags.regularTags.push(t);
        }
      });
    }
    // Get the video tags with earliest timestamp
    Object.values(fragments).forEach((tagFragments) => {
      tagFragments.sort((a, b) => {
        const aStart = parseFloat(a.node.fragment.match(/\d+(\.\d+)?/)[0]);
        const bStart = parseFloat(b.node.fragment.match(/\d+(\.\d+)?/)[0]);
        return aStart - bStart;
      });
      splitTags.videoTags.push(tagFragments[0]);
    });

    return splitTags;
  });

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

  const readOnly =
    !can(projectMedia.permissions, 'update ProjectMedia') ||
    projectMedia.is_secondary ||
    projectMedia.suggested_main_item?.dbid ||
    projectMedia.archived > CheckArchivedFlags.NONE;

  const { regularTags, videoTags } = filterTags(projectMedia.tags.edges);
  const tags = regularTags.concat(videoTags);

  console.log('tags', tags); // eslint-disable-line

  const onSuccess = () => {
    console.log('created or deleted tags successfully'); // eslint-disable-line
  };
  const onFailure = () => {
    console.log('failed to create or delete tags'); // eslint-disable-line
  };

  const handleCreateTag = (value) => {
    // const context = new CheckContext(this).getContextStore();
    createTag(
      {
        projectMedia,
        value,
        // annotator: context.currentUser,
      },
      onSuccess,
      onFailure,
    );
  };

  const handleRemoveTag = (value) => {
    const removedTag = projectMedia.tags.edges.find(tag => tag.node.tag_text === value);
    if (removedTag) {
      deleteTag(
        {
          projectMedia,
          tagId: removedTag.node.id,
        },
        onSuccess,
        onFailure,
      );
    }
  };

  const handleSetTags = (value) => {
    tags.forEach((text) => {
      if (!value.includes(text)) handleRemoveTag(text);
    });
    value.forEach((val) => {
      if (!tags.includes(val)) handleCreateTag(val);
    });
  };

  // const selected = projectMedia.tags.edges.map(t => t.node.tag_text);
  // const options = projectMedia.team.tag_texts.edges.map(tt => ({ label: tt.node.text, value: tt.node.text }));

  return (
    <TagList
      readOnly={readOnly}
      setTags={handleSetTags}
      onClickTag={handleTagViewClick}
      tags={tags.map(t => t.node.tag_text)}
    />
  );
};

MediaTagsComponent.contextTypes = {
  store: PropTypes.object,
};

MediaTagsComponent.propTypes = {
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
  }).isRequired,
};

export { MediaTagsComponent }; // eslint-disable-line import/no-unused-modules

const MediaTags = ({ projectMediaId }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query MediaTagsQuery($ids: String!) {
        project_media(ids: $ids) {
          dbid
          archived
          is_secondary
          permissions
          team {
            slug
            #  tag_texts(last: 100) {
            #    edges {
            #      node {
            #        text
            #      }
            #    }
            #  }
          }
          suggested_main_item {
            dbid
          }
          tags(last: 100) {
            edges {
              node {
                # tag,
                tag_text
                fragment
                id
              }
            }
          }
        }
      }
    `}
    variables={{
      ids: `${projectMediaId},,`,
    }}
    render={({ error, props }) => {
      if (!error && props) {
        return (<MediaTagsComponent projectMedia={props.project_media} />);
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return null;
    }}
  />
);

export default MediaTags;
