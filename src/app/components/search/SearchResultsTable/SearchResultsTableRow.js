import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';

const swallowClick = (ev) => {
  // prevent <TableRow onClick> from firing when we check the checkbox
  ev.stopPropagation();
};

const useStyles = makeStyles({
  root: ({ dbid }) => ({
    cursor: dbid ? 'pointer' : 'auto',
  }),
});

export default function SearchResultsTableRow({
  projectMedia, checked, columnDefs, onChangeChecked, onClick,
}) {
  const { dbid } = projectMedia;
  const classes = useStyles({ dbid });

  const handleClick = React.useCallback((ev) => {
    if (!dbid) {
      return;
    }
    onClick(ev, projectMedia);
  }, [projectMedia, onClick]);

  const handleChangeChecked = React.useCallback((ev) => {
    if (!dbid) {
      return;
    }
    onChangeChecked(ev, projectMedia);
  }, [projectMedia, onChangeChecked]);

  return (
    <TableRow
      onClick={handleClick}
      aria-checked={checked}
      selected={checked}
      classes={classes}
      className="medias__item" // for integration tests
      hover={!!dbid} // only allow hover when clickable
    >
      <TableCell padding="checkbox" onClick={swallowClick}>
        <Checkbox checked={checked} onChange={handleChangeChecked} />
      </TableCell>
      {columnDefs.map(({ cellComponent: Cell }) => {
        const componentName = Cell.displayName || Cell.name;
        return <Cell key={componentName} projectMedia={projectMedia} />;
      })}
    </TableRow>
  );
}
SearchResultsTableRow.propTypes = {
  columnDefs: PropTypes.arrayOf(PropTypes.shape({
    cellComponent: PropTypes.elementType.isRequired,
  }).isRequired).isRequired,
  projectMedia: PropTypes.shape({
    dbid: PropTypes.number, // or null/0
  }).isRequired,
  checked: PropTypes.bool.isRequired,
  onChangeChecked: PropTypes.func.isRequired, // onChangeChecked(ev, projectMedia) => undefined
  onClick: PropTypes.func.isRequired, // onClick(ev, projectMedia) => undefined
};
