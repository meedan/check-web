import React from 'react';
import PropTypes from 'prop-types';
import styles from './ListWidget.module.css';

const ListWidgetItem = ({
  id,
  itemCount,
  itemText,
}) => (
  <li className={styles.listWidgetTypography} key={id}>
    <div>{itemText}</div>
    <div>{itemCount}</div>
  </li>
);

ListWidgetItem.defaultProps = {
  id: null,
  itemCount: null,
  itemText: null,
};

ListWidgetItem.propTypes = {
  id: PropTypes.string,
  itemCount: PropTypes.string,
  itemText: PropTypes.string,
};

export default ListWidgetItem;
