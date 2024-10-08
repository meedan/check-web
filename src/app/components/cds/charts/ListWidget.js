import React from 'react';
import PropTypes from 'prop-types';
import ListWidgetItem from './ListWidgetItem';
import styles from './ListWidget.module.css';

const ListWidget = ({
  color,
  items,
  title,
}) => (
  <div className={styles.listWidgetWrapper} style={{ backgroundColor: color }}>
    <div>
      {title}
    </div>
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
  color: 'var(--color-pink-93)',
};

ListWidget.propTypes = {
  color: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({ itemLink: PropTypes.string, itemText: PropTypes.string, itemValue: PropTypes.string })).isRequired,
  title: PropTypes.node.isRequired,
};

export default ListWidget;
