import React from 'react';
import PropTypes from 'prop-types';
import styles from './ListWidget.module.css';

const ListWidgetItem = ({
  id,
  itemCount,
  itemLink,
  itemText,
}) => (
  <li className={styles.listWidgetItemWrapper} key={id}>
    {
      itemLink ?
        <div><a href={itemLink}>{itemText}</a></div>
        :
        <div className={styles.listWidgetItemText}>{itemText}</div>
    }
    <div>{itemCount}</div>
  </li>
);

ListWidgetItem.defaultProps = {
  id: null,
  itemCount: '-',
  itemLink: null,
  itemText: null,
};

ListWidgetItem.propTypes = {
  id: PropTypes.string,
  itemCount: PropTypes.string,
  itemLink: PropTypes.string,
  itemText: PropTypes.string,
};

export default ListWidgetItem;
