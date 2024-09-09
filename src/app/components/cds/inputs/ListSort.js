// DESIGNS: https://www.figma.com/file/7ZlvdotCAzeIQcbIKxOB65/Components?type=design&node-id=1475-46077&mode=design&t=G3fBIdgR6AWtOlNu-4
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';
import cx from 'classnames/bind';
import Select from './Select';
import ArrowDropUpIcon from '../../../icons/arrow_upward.svg';
import ArrowDropDownIcon from '../../../icons/arrow_downward.svg';
import Tooltip from '../alerts-and-prompts/Tooltip';
import styles from './ListSort.module.css';

const sortLabels = defineMessages({
  sortTitle: {
    id: 'searchResults.sortTitle',
    defaultMessage: 'Title',
    description: 'Label for sort criteria option displayed in a drop-down in listing pages',
  },
  sortFactChecksCount: {
    id: 'searchResults.sortFactChecksCount',
    defaultMessage: 'Fact-checks (count)',
    description: 'Label for sort criteria option displayed in a drop-down in listing pages',
  },
  sortMediaCount: {
    id: 'searchResults.sortMediaCount',
    defaultMessage: 'Media (count)',
    description: 'Label for sort criteria option displayed in a drop-down in listing pages',
  },
  sortRating: {
    id: 'searchResults.sortRating',
    defaultMessage: 'Rating',
    description: 'Label for sort criteria option displayed in a drop-down in listing pages',
  },
  sortRequestsCount: {
    id: 'searchResults.sortRequestsCount',
    defaultMessage: 'Requests (count)',
    description: 'Label for sort criteria option displayed in a drop-down in listing pages',
  },
  sortFactCheckPublishedOn: {
    id: 'searchResults.sortFactCheckPublishedOn',
    defaultMessage: 'Fact-check published (date)',
    description: 'Label for sort criteria option displayed in a drop-down in listing pages',
  },
  sortLastSeen: {
    id: 'searchResults.sortLastSeen',
    defaultMessage: 'Last request (date)',
    description: 'Label for sort criteria option displayed in a drop-down in listing pages',
  },
  sortReportStatus: {
    id: 'searchResults.sortReportStatus',
    defaultMessage: 'Report (status)',
    description: 'Label for sort criteria option displayed in a drop-down in listing pages',
  },
  sortScore: {
    id: 'searchResults.sortScore',
    defaultMessage: 'Search: Best Match',
    description: 'Label for sort criteria option displayed in a drop-down in listing pages',
  },
  sortSubmitted: {
    id: 'searchResults.sortSubmitted',
    defaultMessage: 'Submitted (date)',
    description: 'Label for sort criteria option displayed in a drop-down in listing pages',
  },
  sortSuggestionsCount: {
    id: 'searchResults.sortSuggestionsCount',
    defaultMessage: 'Suggestions (count)',
    description: 'Label for sort criteria option displayed in a drop-down in listing pages',
  },
  sortUpdated: {
    id: 'searchResults.sortUpdated',
    defaultMessage: 'Updated (date)',
    description: 'Label for sort criteria option displayed in a drop-down in listing pages',
  },
});

const ListSort = ({
  className,
  onChange,
  options,
  sort,
  sortType,
}) => {
  const handleChangeSortCriteria = (e) => {
    onChange({ sort: e.target.value, sortType });
  };

  const handleChangeSortDirection = () => {
    onChange({ sort, sortType: (sortType === 'ASC' ? 'DESC' : 'ASC') });
  };

  return (
    <div
      className={cx(
        'list-sort',
        styles.listSort,
        {
          [className]: true,
        })
      }
    >
      <FormattedMessage defaultMessage="Sort" description="Label for sort criteria drop-down field displayed on listing pages" id="listSort.sort" />
      <Select className={styles.listSortSelect} value={sort} onChange={handleChangeSortCriteria}>
        {options.map(({ label, value }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </Select>
      <Tooltip
        arrow
        title={
          <FormattedMessage defaultMessage="Change list sorting direction" description="Tooltip to tell the user they can change the direction of the list sort" id="listSort.changeDirection" />
        }
      >
        <button className={`${styles.listSortDirectionButton} ${sortType === 'ASC' ? 'list-sort-asc' : 'list-sort-desc'}`} type="button" onClick={handleChangeSortDirection}>
          {sortType === 'ASC' ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        </button>
      </Tooltip>
    </div>
  );
};

ListSort.defaultProps = {
  className: null,
  options: [],
  sort: 'recent_activity',
  sortType: 'ASC',
  onChange: () => {},
};

ListSort.propTypes = {
  className: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.exact({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
  sort: PropTypes.string,
  sortType: PropTypes.oneOf(['ASC', 'DESC']),
  onChange: PropTypes.func,
};

export { sortLabels };

export default ListSort;
