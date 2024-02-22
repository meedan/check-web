// DESIGNS: https://www.figma.com/file/7ZlvdotCAzeIQcbIKxOB65/Components?type=design&node-id=1475-46077&mode=design&t=G3fBIdgR6AWtOlNu-4
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ArrowDropUpIcon from '../../../icons/arrow_drop_up.svg';
import ArrowDropDownIcon from '../../../icons/arrow_drop_down.svg';
import Tooltip from '../alerts-and-prompts/Tooltip';
import Select from './Select';
import styles from './ListSort.module.css';

const ListSort = ({
  options,
  sort,
  sortType,
  onChange,
}) => {
  const handleChangeSortCriteria = (e) => {
    onChange({ sort: e.target.value, sortType });
  };

  const handleChangeSortDirection = () => {
    onChange({ sort, sortType: (sortType === 'ASC' ? 'DESC' : 'ASC') });
  };

  return (
    <div className={`${styles.listSort} list-sort`}>
      <FormattedMessage id="listSort.sort" defaultMessage="Sort" description="Label for sort criteria drop-down field displayed on fact-checks page." />
      <Select onChange={handleChangeSortCriteria} value={sort}>
        {options.map(({ label, value }) => (
          <option value={value}>{label}</option>
        ))}
      </Select>
      <Tooltip
        arrow
        title={
          <FormattedMessage id="listSort.changeDirection" defaultMessage="Change list sorting direction" description="Tooltip to tell the user they can change the direction of the list sort" />
        }
      >
        <button type="button" onClick={handleChangeSortDirection} className={`${styles.listSortDirectionButton} ${sortType === 'ASC' ? styles.listSortAsc : styles.listSortDesc} ${sortType === 'ASC' ? 'list-sort-asc' : 'list-sort-desc'}`}>
          <ArrowDropUpIcon />
          <ArrowDropDownIcon />
        </button>
      </Tooltip>
    </div>
  );
};

ListSort.defaultProps = {
  options: [],
  sort: 'recent_activity',
  sortType: 'ASC',
  onChange: () => {},
};

ListSort.propTypes = {
  options: PropTypes.arrayOf(PropTypes.exact({
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
  sort: PropTypes.string,
  sortType: PropTypes.oneOf(['ASC', 'DESC']),
  onChange: PropTypes.func,
};

export default ListSort;
