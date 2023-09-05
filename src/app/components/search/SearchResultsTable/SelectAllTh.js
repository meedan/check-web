import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import TableCell from '@material-ui/core/TableCell';
import styles from '../SearchResults.module.css';

export default function SelectAllTh({ selectedIds, projectMedias, onChangeSelectedIds }) {
  const handleChange = React.useCallback((ev) => {
    const newIds = ev.target.checked ? projectMedias.map(pm => pm.id) : [];
    onChangeSelectedIds(newIds);
  }, [projectMedias, onChangeSelectedIds]);

  const nSelected = selectedIds.length;
  const nTotal = projectMedias.length;

  return (
    <TableCell padding="checkbox" className={styles['unread-status']}>
      <Checkbox
        indeterminate={nSelected ? nSelected < nTotal : false}
        checked={nSelected ? nSelected === nTotal : false}
        onChange={handleChange}
      />
    </TableCell>
  );
}
SelectAllTh.propTypes = {
  selectedIds: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  projectMedias: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired).isRequired,
  onChangeSelectedIds: PropTypes.func.isRequired,
};
