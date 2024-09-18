import React from 'react';
import PropTypes from 'prop-types';
import styles from './ListWidget.module.css';

const ListWidgetItem = ({
  id,
  itemLink,
  itemText,
  itemValue,
}) => (
  <li className={styles.listWidgetItemWrapper} key={id}>
    {
      itemLink ?
        <div><a href={itemLink}>{itemText}</a></div>
        :
        <div className={styles.listWidgetItemText}>{itemText}</div>
    }
    <div>{itemValue}</div>
  </li>
);

ListWidgetItem.defaultProps = {
  id: null,
  itemLink: null,
  itemText: null,
  itemValue: '-',
};

ListWidgetItem.propTypes = {
  id: PropTypes.string,
  itemLink: PropTypes.string,
  itemText: PropTypes.node,
  itemValue: PropTypes.string,
};

export default ListWidgetItem;
