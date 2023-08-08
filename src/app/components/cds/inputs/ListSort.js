// DESIGNS: https://www.figma.com/file/7ZlvdotCAzeIQcbIKxOB65/Components?type=design&node-id=1475-46077&mode=design&t=G3fBIdgR6AWtOlNu-4
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ArrowDropUpIcon from '../../../icons/arrow_drop_up.svg';
import ArrowDropDownIcon from '../../../icons/arrow_drop_down.svg';
import Tooltip from '../alerts-and-prompts/Tooltip';
import Select from './Select';
import styles from './ListSort.module.css';

const ListSort = ({ sort, sortType, onChange }) => {
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
        <FormattedMessage id="listSort.date" defaultMessage="Date updated" description="Label for sort criteria option displayed in a drop-down in the fact-checks page.">
          { label => (<option value="recent_activity">{label}</option>) }
        </FormattedMessage>
        <FormattedMessage id="listSort.status" defaultMessage="Rating" description="Label for sort criteria option displayed in a drop-down in the fact-checks page.">
          { label => (<option value="status_index">{label}</option>) }
        </FormattedMessage>
      </Select>
      <Tooltip title={
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
  sort: 'recent_activity',
  sortType: 'ASC',
  onChange: () => {},
};

ListSort.propTypes = {
  sort: PropTypes.string,
  sortType: PropTypes.oneOf(['ASC', 'DESC']),
  onChange: PropTypes.func,
};

export default ListSort;
