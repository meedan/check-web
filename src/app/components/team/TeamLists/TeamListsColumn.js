import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import TeamListsItem from './TeamListsItem';
import styles from './TeamLists.module.css';

const TeamListsColumn = ({
  columns,
  title,
  onToggle,
  onMoveUp,
  onMoveDown,
  className,
  placeholder,
}) => (
  <div
    className={cx(
      styles['teamlist-column'],
      {
        [className]: true,
      })
    }
  >
    <span className="typography-subtitle2">
      {title}
    </span>
    <div className={styles['teamlist-column-items']}>
      {columns.map((column, i) => (
        <TeamListsItem
          key={column.key}
          column={column}
          onToggle={onToggle}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          isFirst={i === 0}
          isLast={i === columns.length - 1}
          isRequired={column.key === 'created_at_timestamp'}
        />
      ))}
      { columns.length === 0 ?
        <div className={styles['teamlist-placeholder']}>
          {placeholder}
        </div> : null }
    </div>
  </div>
);

TeamListsColumn.defaultProps = {
  onMoveUp: null,
  onMoveDown: null,
  className: null,
  placeholder: (
    <FormattedMessage
      id="teamListsColumn.none"
      defaultMessage="No columns available"
      description="Placeholder text when there are no columns left for selection when the user is customizing which ones they want to show or hide"
    />
  ),
};

TeamListsColumn.propTypes = {
  title: PropTypes.node.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    index: PropTypes.number.isRequired,
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
  }).isRequired).isRequired,
  onToggle: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
  className: PropTypes.string,
  placeholder: PropTypes.node,
};

export default TeamListsColumn;
