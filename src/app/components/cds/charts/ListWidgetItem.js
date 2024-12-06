import React from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import { getDisplayValue } from './NumberWidget';
import styles from './ListWidget.module.css';

const ListWidgetItem = ({
  itemLink,
  itemText,
  itemValue,
}) => (
  <li className={styles.listWidgetItemWrapper}>
    {
      itemLink ?
        <div className={styles.listWidgetItemText} title={itemText}>
          <Link to={itemLink}>{itemText}</Link>
        </div>
        :
        <div className={styles.listWidgetItemText} title={itemText}>{itemText}</div>
    }
    <div className={styles.listWidgetItemValue}>{getDisplayValue(itemValue)}</div>
  </li>
);

ListWidgetItem.defaultProps = {
  itemLink: null,
  itemText: null,
  itemValue: null,
};

ListWidgetItem.propTypes = {
  itemLink: PropTypes.string,
  itemText: PropTypes.node,
  itemValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ListWidgetItem;
