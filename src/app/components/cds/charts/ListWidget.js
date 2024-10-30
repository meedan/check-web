import React from 'react';
import PropTypes from 'prop-types';
import ListWidgetItem from './ListWidgetItem';
import styles from './ListWidget.module.css';

const ListWidget = ({
  actionButton,
  color,
  emptyText,
  items,
  title,
}) => (
  <div className={styles.listWidgetWrapper} style={{ backgroundColor: color }}>
    <div>
      {title}
    </div>
    { !items.length && (
      <div className={styles.listWidgetEmpty}>
        <span className={styles.listWidgetEmptyText}>{emptyText}</span>
        {actionButton}
      </div>
    )}
    <ul>
      { items.map(i => (
        <ListWidgetItem
          itemLink={i.itemLink}
          itemText={i.itemText}
          itemValue={i.itemValue}
          key={i.id}
        />
      ))}
    </ul>
  </div>
);

ListWidget.defaultProps = {
  actionButton: null,
  color: 'var(--color-pink-93)',
  emptyText: null,
};

ListWidget.propTypes = {
  actionButton: PropTypes.node,
  color: PropTypes.string,
  emptyText: PropTypes.node,
  items: PropTypes.arrayOf(PropTypes.shape({ itemLink: PropTypes.string, itemText: PropTypes.string, itemValue: PropTypes.string })).isRequired,
  title: PropTypes.node.isRequired,
};

export default ListWidget;
