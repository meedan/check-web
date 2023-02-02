import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';
import { getPathnameAndSearch } from '../../../urlHelpers';

export default function LinkedItemsCountCell({ projectMedia, projectMediaUrl }) {
  const { pathname, search } = getPathnameAndSearch(projectMediaUrl);
  // we need to count the "main" media itself on the list view, so we need to add 1 in the count.
  const linkedItemsCount = projectMedia.list_columns_values.linked_items_count + 1;
  const linkedItemsUrl = `${pathname}/similar-media${search}`;
  return <NumberCell value={linkedItemsCount} linkTo={linkedItemsCount ? linkedItemsUrl : null} />;
}

LinkedItemsCountCell.propTypes = {
  projectMedia: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    team: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }).isRequired,
    list_columns_values: PropTypes.shape({
      linked_items_count: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};
