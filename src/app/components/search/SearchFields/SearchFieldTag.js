import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import LocalOfferIcon from '../../../icons/local_offer.svg';
import MultiSelectFilter from '../MultiSelectFilter';

let lastTypedValue = '';

const SearchFieldTag = ({
  teamSlug,
  query,
  onChange,
  onRemove,
  onToggleOperator,
  operator,
  readOnly,
}) => {
  const [keyword, setKeyword] = React.useState('');
  // Keep random argument in state so it's generated only once when component is mounted (CHECK-2366)
  const [random] = React.useState(String(Math.random()));

  // Maximum number of options to be displayed
  const max = 2; // Set to 2 for not needing lots of tags to test feature

  const handleType = (value) => {
    lastTypedValue = value;
    setTimeout(() => {
      if (value === lastTypedValue) {
        setKeyword(value);
      }
    }, 1500);
  };

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query SearchFieldTagQuery($teamSlug: String!, $keyword: String, $max: Int, $random: String!) {
          team(slug: $teamSlug, random: $random) {
            tag_texts_count(keyword: $keyword)
            tag_texts(first: $max, keyword: $keyword) {
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
        max,
        random,
      }}
      render={({ error, props }) => {
        const loading = !error && !props;
        let plainTagsTexts = [];
        let total = 0;
        if (!error && props) {
          plainTagsTexts = props.team.tag_texts ? props.team.tag_texts.edges.map(t => t.node.text) : [];
          total = props.team.tag_texts_count;
        }
        return (
          <FormattedMessage id="SearchFieldTag.label" defaultMessage="Tag is" description="Prefix label for field to filter by tags">
            { label => (
              <MultiSelectFilter
                label={label}
                icon={<LocalOfferIcon />}
                loading={loading}
                selected={query.tags}
                options={plainTagsTexts.map(t => ({ label: t, value: t }))}
                onChange={onChange}
                onToggleOperator={onToggleOperator}
                operator={operator}
                readOnly={readOnly}
                onRemove={onRemove}
                onType={total > max ? handleType : null}
                inputPlaceholder={total > max ? keyword : null}
              />
            )}
          </FormattedMessage>
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
