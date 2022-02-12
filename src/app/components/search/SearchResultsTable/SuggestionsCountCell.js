import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';

export default function SuggestionsCountCell({ projectMedia }) {
  const suggestionsCount = projectMedia.list_columns_values.suggestions_count;
  const suggestionsUrl = `/${projectMedia.team.slug}/media/${projectMedia.dbid}/suggested-matches`;
  return <NumberCell value={suggestionsCount} linkTo={suggestionsCount ? suggestionsUrl : null} />;
}

SuggestionsCountCell.propTypes = {
  projectMedia: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    team: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }).isRequired,
    list_columns_values: PropTypes.shape({
      suggestions_count: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
