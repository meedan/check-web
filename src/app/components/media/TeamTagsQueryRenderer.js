import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import TagPicker from '../cds/menus-lists-dialogs/TagPicker';

const FILTER_PAGE_SIZE = 50;

let lastTypedValue = '';
let plainTagsTexts = [];

const TeamTagsQueryRenderer = ({
  readOnly,
  setTags,
  tags,
  teamSlug,
}) => {
  const [keyword, setKeyword] = React.useState('');
  const [pageSize, setPageSize] = React.useState(FILTER_PAGE_SIZE);

  const handleType = (value) => {
    lastTypedValue = value;
    setTimeout(() => {
      if (value === lastTypedValue) {
        setKeyword(value);
      }
    }, 1500);
  };

  const handleLoadMore = () => {
    setPageSize(pageSize + FILTER_PAGE_SIZE);
    return false;
  };

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query TeamTagsQueryRendererQuery($teamSlug: String!, $keyword: String, $pageSize: Int) {
          team(slug: $teamSlug) {
            tag_texts_count(keyword: $keyword)
            tag_texts(first: $pageSize, keyword: $keyword) {
              edges {
                node {
                  text
                }
              }
            }
          }
        }
      `}
      render={({ error, props }) => {
        if (error) return null;

        const loading = Boolean(!error && !props);

        // TODO: This "merge selected tags with plainTagsTexts" logic is identical
        // to `SearchFieldTag` component. Evaluate reusing TeamTagsQueryRenderer there.

        let total = 0;
        if (!error && props) {
          plainTagsTexts = props.team.tag_texts ? props.team.tag_texts.edges.map(t => t.node.text) : [];
          total = props.team.tag_texts_count;
        }

        // Due to tags pagination, a tag used in an item can be on a not loaded yet page.
        // Merge `tags` with plainTagsText even if they're not loaded from graphql.
        let selected = [];
        if (tags) {
          selected = Array.isArray(tags) ? tags : [tags];
        }
        plainTagsTexts = [...new Set(selected.concat(plainTagsTexts))];

        const hasMore = total > pageSize;

        return (
          <TagPicker
            hasMore={hasMore}
            loadMore={handleLoadMore}
            loading={loading}
            options={plainTagsTexts.map(t => ({ label: t, value: t }))}
            readOnly={readOnly}
            searchTerm={keyword}
            setSearchTerm={handleType}
            setTags={setTags}
            tags={tags}
          />
        );
      }}
      variables={{
        teamSlug,
        pageSize,
        keyword,
      }}
    />
  );
};

TeamTagsQueryRenderer.defaultProps = {
  readOnly: false,
};

TeamTagsQueryRenderer.propTypes = {
  readOnly: PropTypes.bool,
  setTags: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  teamSlug: PropTypes.string.isRequired,
};

export default TeamTagsQueryRenderer;
