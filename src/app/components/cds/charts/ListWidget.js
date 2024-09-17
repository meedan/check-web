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
      { Object.values(items).map(i => (
        <ListWidgetItem
          itemCount={i.itemCount}
          itemText={i.itemText}
          key={i.id}
        />
      ))}
    </ul>
  </div>
);

ListWidget.defaultProps = {
  color: 'var(--color-pink-93)',
  items: null,
  title: null,
};

ListWidget.propTypes = {
  color: PropTypes.string,
  items: PropTypes.object,
  title: PropTypes.string,
};

export default ListWidget;
