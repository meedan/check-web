import React from 'react';
import PropTypes from 'prop-types';

const ListWidgetItem = ({
  id,
  itemCount,
  itemText,
}) => (
  <div>
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
