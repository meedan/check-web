/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import Checkbox from '@material-ui/core/Checkbox';
import styles from './SearchResults.module.css';

export default function SelectAllCheckbox({
  className,
  onChangeSelectedIds,
  projectMedias,
  selectedIds,
}) {
  const handleChange = React.useCallback((ev) => {
    const newIds = ev.target.checked ? projectMedias.map(pm => pm.id) : [];
    onChangeSelectedIds(newIds);
  }, [projectMedias, onChangeSelectedIds]);

  const nSelected = selectedIds.length;
  const nTotal = projectMedias.length;

  return (
    <div className={cx(className, styles['unread-status'])}>
      <Checkbox
        checked={nSelected ? nSelected === nTotal : false}
        indeterminate={nSelected ? nSelected < nTotal : false}
        onChange={handleChange}
      />
    </div>
  );
}

SelectAllCheckbox.defaultProps = {
  className: null,
};

SelectAllCheckbox.propTypes = {
  className: PropTypes.string,
  selectedIds: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  projectMedias: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  onChangeSelectedIds: PropTypes.func.isRequired,
};
