import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { browserHistory } from 'react-router';
import mergeWith from 'lodash.mergewith';
import xor from 'lodash.xor';
import memoize from 'memoize-one';
import styled from 'styled-components';
import Chip from '@material-ui/core/Chip';
import TagMenu from '../tag/TagMenu';
import { searchQueryFromUrl, urlFromSearchQuery } from '../search/Search';
import VideoAnnotationIcon from '../../../assets/images/video-annotation/video-annotation';
import { units } from '../../styles/js/shared';

const StyledMediaTagsContainer = styled.div`
  width: 100%;

  .media-tags {
    &:empty {
      display: none;
    }
  }

  .media-tags__list {
    display: flex;
    flex-wrap: wrap;
    list-style: none;
    padding: ${units(0.5)} ${units(0.5)} ${units(0.5)} 0;
    margin: 0 0 0 ${units(-0.5)};

    li {
      margin: ${units(0.5)} ${units(0.5)} ${units(0.5)} 0;
    }
  }
`;

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */
class MediaTags extends React.Component {
  filterTags = memoize((tags) => {
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

  searchTagUrl(tagString) {
    const { projectMedia } = this.props;
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
  }

  handleTagViewClick(tagString) {
    const url = this.searchTagUrl(tagString);
    if (window !== window.parent) { // Browser extension
      window.open(`${window.location.origin}${url}`);
    } else {
      browserHistory.push(url);
    }
  }

  handleVideoAnnotationIconClick = (e, fragment) => {
    e.stopPropagation();
    if (this.props.onTimelineCommentOpen) {
      this.props.onTimelineCommentOpen(fragment);
    }
  };

  render() {
    const { projectMedia } = this.props;
    const readOnly = projectMedia.is_secondary || projectMedia.suggested_main_item;
    const { regularTags, videoTags } = this.filterTags(projectMedia.tags.edges);
    const tags = regularTags.concat(videoTags);

    return (
      <StyledMediaTagsContainer className="media-tags__container">
        <div className="media-tags">
          <ul className="media-tags__list">
            <li>{ readOnly ? null : <TagMenu media={projectMedia} /> }</li>
            {tags.map((tag) => {
              if (tag.node.tag_text) {
                return (
                  <li key={tag.node.id}>
                    <Chip
                      icon={
                        tag.node.fragment ?
                          <VideoAnnotationIcon
                            onClick={e =>
                              this.handleVideoAnnotationIconClick(e, tag.node.fragment)}
                          />
                          : null
                      }
                      className="media-tags__tag"
                      onClick={this.handleTagViewClick.bind(this, tag.node.tag_text)}
                      label={tag.node.tag_text.replace(/^#/, '')}
                    />
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      </StyledMediaTagsContainer>
    );
  }
}

MediaTags.propTypes = {
  projectMedia: PropTypes.shape({
    tags: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          tag: PropTypes.string.isRequired,
          id: PropTypes.string.isRequired,
          tag_text: PropTypes.string.isRequired,
        }),
      }).isRequired).isRequired,
    }).isRequired,
  }).isRequired,
};

export { MediaTags };
export default createFragmentContainer(MediaTags, graphql`
  fragment MediaTags_projectMedia on ProjectMedia {
    id
    dbid
    team {
      slug
    }
    is_secondary
    suggested_main_item
    tags(first: 10000) {
      edges {
        node {
          id
          tag
          tag_text
          fragment
        }
      }
    }
  }
`);
