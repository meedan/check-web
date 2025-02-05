import React from 'react';
import PropTypes from 'prop-types';
import RemoveableWrapper from '../RemoveableWrapper';
import styles from '../search.module.css';

const SearchFieldDummy = ({
  icon,
  label,
  onRemove,
  readOnly,
  version,
}) => (
  <div className={styles['filter-wrapper']}>
    <RemoveableWrapper icon={icon} key={version} readOnly={readOnly} onRemove={onRemove}>
      {label}
    </RemoveableWrapper>
  </div>
);

SearchFieldDummy.defaultProps = {
  readOnly: false,
  version: undefined,
  onRemove: null,
};

SearchFieldDummy.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.node.isRequired,
  readOnly: PropTypes.bool,
  version: PropTypes.string,
  onRemove: PropTypes.func,
};

export default SearchFieldDummy;
