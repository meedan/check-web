/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';
import MultiSelectFilter from '../MultiSelectFilter';

const SearchFieldTag = ({
  teamSlug,
  query,
  onChange,
  onRemove,
  onToggleOperator,
  operator,
  readOnly,
}) => {
  const [random] = React.useState(String(Math.random()));
  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query SearchFieldTagQuery($teamSlug: String!, $random: String!) {
          team(slug: $teamSlug, random: $random) {
            id
            tag_texts(first: 10000) {
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
        random,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          const plainTagsTexts = props.team.tag_texts ?
            props.team.tag_texts.edges.map(t => t.node.text) : [];
          return (
            <FormattedMessage id="SearchFieldTag.label" defaultMessage="Tag is" description="Prefix label for field to filter by tags">
              { label => (
                <MultiSelectFilter
                  label={label}
                  icon={<LocalOfferIcon />}
                  selected={query.tags}
                  options={plainTagsTexts.map(t => ({ label: t, value: t }))}
                  onChange={onChange}
                  onToggleOperator={onToggleOperator}
                  operator={operator}
                  readOnly={readOnly}
                  onRemove={onRemove}
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

SearchFieldTag.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  query: PropTypes.object.isRequired,
  onRemove: PropTypes.func.isRequired,
  onToggleOperator: PropTypes.func.isRequired,
  operator: PropTypes.string.isRequired,
  readOnly: PropTypes.bool.isRequired,
};

export default SearchFieldTag;
