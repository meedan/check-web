import React from 'react';
import PropTypes from 'prop-types';
import styles from './ListWidget.module.css';

const ListWidgetItem = ({
  id,
  itemCount,
  itemText,
}) => (
  <div className={styles.listWidgetTypography}>
    {id}
    {itemCount}
    {itemText}
  </div>
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
