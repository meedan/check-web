import React from 'react';
import PropTypes from 'prop-types';
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
        <div className={styles.listWidgetItemText}><a href={itemLink}>{itemText}</a></div>
        :
        <div className={styles.listWidgetItemText}>{itemText}</div>
    }
    <div className={styles.listWidgetItemValue}>{itemValue || '-'}</div>
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
