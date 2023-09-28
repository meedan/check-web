import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import LocalOfferIcon from '../../../icons/local_offer.svg';
import MultiSelectFilter from '../MultiSelectFilter';

const FILTER_PAGE_SIZE = 50;

let lastTypedValue = '';
let plainTagsTexts = [];

const SearchFieldTag = ({
  teamSlug,
  query,
  onChange,
  onRemove,
  onToggleOperator,
  operator,
  readOnly,
}) => {
  // Keep random argument in state so it's generated only once when component is mounted (CHECK-2366)
  const [random] = React.useState(String(Math.random()));
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
        query SearchFieldTagQuery($teamSlug: String!, $keyword: String, $pageSize: Int, $random: String!) {
          team(slug: $teamSlug, random: $random) {
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
      variables={{
        teamSlug,
        keyword,
        pageSize,
        random,
      }}
      render={({ error, props }) => {
        const loading = Boolean(!error && !props);
        let total = 0;
        if (!error && props) {
          plainTagsTexts = props.team.tag_texts ? props.team.tag_texts.edges.map(t => t.node.text) : [];
          total = props.team.tag_texts_count;
        }

        // Due to tags pagination, a tag used in a query can be on a not loaded yet page.
        // Merge `query.tags` with plainTagsText even if they're not loaded from graphql.
        let queryTags = [];
        if (query.tags) {
          queryTags = Array.isArray(query.tags) ? query.tags : [query.tags];
        }
        plainTagsTexts = [...new Set(queryTags.concat(plainTagsTexts))];

        const hasMore = total > pageSize;
        return (
          <MultiSelectFilter
            label={<FormattedMessage id="SearchFieldTag.label" defaultMessage="Tag is" description="Prefix label for field to filter by tags" />}
            icon={<LocalOfferIcon />}
            loading={loading}
            selected={query.tags}
            options={plainTagsTexts.map(t => ({ label: t, value: t }))}
            onChange={onChange}
            onScrollBottom={handleLoadMore}
            hasMore={hasMore}
            onToggleOperator={onToggleOperator}
            operator={operator}
            readOnly={readOnly}
            onRemove={onRemove}
            onType={handleType}
            inputPlaceholder={keyword}
          />
        );
      }}
    />
  );
};

SearchFieldTag.defaultProps = {
  operator: 'or',
};

SearchFieldTag.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  query: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
  onToggleOperator: PropTypes.func.isRequired,
  operator: PropTypes.string,
  readOnly: PropTypes.bool.isRequired,
};

export default SearchFieldTag;
