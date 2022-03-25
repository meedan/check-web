import React from 'react';
import PropTypes from 'prop-types';
import NumberCell from './NumberCell';
import { getPathnameAndSearch } from '../../../urlHelpers';

export default function LinkedItemsCountCell({ projectMedia, projectMediaUrl }) {
  const { pathname, search } = getPathnameAndSearch(projectMediaUrl);
  const linkedItemsCount = projectMedia.list_columns_values.linked_items_count;
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
