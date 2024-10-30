import React from 'react';
import PropTypes from 'prop-types';
import { getDisplayValue } from './NumberWidget';
import { isValidURL } from '../../../helpers';
import styles from './ListWidget.module.css';

const ListWidgetItem = ({
  id,
  itemLink,
  itemText,
  itemValue,
}) => (
  <li className={styles.listWidgetItemWrapper} key={id}>
    {
      isValidURL(itemLink) ?
        <div className={styles.listWidgetItemText} title={itemText}><a href={itemLink}>{itemText}</a></div>
        :
        <div className={styles.listWidgetItemText} title={itemText}>{itemText}</div>
    }
    <div className={styles.listWidgetItemValue}>{getDisplayValue(itemValue)}</div>
  </li>
);

ListWidgetItem.defaultProps = {
  id: null,
  itemLink: null,
  itemText: null,
  itemValue: null,
};

ListWidgetItem.propTypes = {
  id: PropTypes.string,
  itemLink: PropTypes.string,
  itemText: PropTypes.node,
  itemValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default ListWidgetItem;
