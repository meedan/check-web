/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import MultiSelectFilter from '../MultiSelectFilter';

let lastTypedValue = '';

const SearchFieldTag = ({
  teamSlug,
  selected,
  onChange,
  onRemove,
  onToggleOperator,
  operator,
  readOnly,
}) => {
  const [keyword, setKeyword] = React.useState('');

  // Maximum number of options to be displayed
  const max = 50;

  const handleType = (value) => {
    lastTypedValue = value;
    setTimeout(() => {
      if (value === lastTypedValue) {
        setKeyword(value);
      }
    }, 2000);
  };

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query SearchFieldTagQuery($teamSlug: String!, $keyword: String, $max: Int) {
          team(slug: $teamSlug) {
            id
            tags_count(keyword: $keyword)
            tags(first: $max, keyword: $keyword) {
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
      }}
      render={({ error, props }) => {
        if (!error && props) {
          const plainTagsTexts = props.team.tags ?
            props.team.tags.edges.map(t => t.node.text) : [];
          const total = props.team.tags_count;
          return (
            <FormattedMessage id="SearchFieldTag.label" defaultMessage="Tag is" description="Prefix label for field to filter by tags">
              { label => (
                <MultiSelectFilter
                  label={label}
                  icon={<LocalOfferIcon />}
                  selected={selected}
                  options={plainTagsTexts.map(t => ({ label: t, value: t }))}
                  onChange={(newValue) => { onChange(newValue); }}
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
        }

        // TODO: We need a better error handling in the future, standardized with other components
        return <CircularProgress size={36} />;
      }}
    />
  );
};

SearchFieldTag.defaultProps = {
  selected: [],
};

SearchFieldTag.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  selected: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  onToggleOperator: PropTypes.func.isRequired,
  operator: PropTypes.string.isRequired,
  readOnly: PropTypes.bool.isRequired,
};

export default SearchFieldTag;
