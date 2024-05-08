import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import Checkbox from '@material-ui/core/Checkbox';
import TableCell from '@material-ui/core/TableCell';
import styles from '../SearchResults.module.css';

export default function SelectAllTh({
  selectedIds,
  projectMedias,
  onChangeSelectedIds,
  className,
}) {
  const handleChange = React.useCallback((ev) => {
    const newIds = ev.target.checked ? projectMedias.map(pm => pm.id) : [];
    onChangeSelectedIds(newIds);
  }, [projectMedias, onChangeSelectedIds]);

  const nSelected = selectedIds.length;
  const nTotal = projectMedias.length;

  return (
    <TableCell padding="checkbox" className={cx(className, styles['unread-status'])}>
      <Checkbox
        indeterminate={nSelected ? nSelected < nTotal : false}
        checked={nSelected ? nSelected === nTotal : false}
        onChange={handleChange}
      />
    </TableCell>
  );
}

SelectAllTh.defaultProps = {
  className: null,
};

SelectAllTh.propTypes = {
  className: PropTypes.string,
  selectedIds: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  projectMedias: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  onChangeSelectedIds: PropTypes.func.isRequired,
};
