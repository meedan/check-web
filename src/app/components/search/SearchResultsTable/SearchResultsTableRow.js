import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import Checkbox from '@material-ui/core/Checkbox';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';
import { boxShadow, opaqueBlack05 } from '../../../styles/js/shared';

const swallowClick = (ev) => {
  // prevent <TableRow onClick> from firing when we check the checkbox
  ev.stopPropagation();
};

const useStyles = makeStyles({
  root: ({ dbid, isRead }) => ({
    cursor: dbid ? 'pointer' : 'auto',
    background: isRead ? opaqueBlack05 : 'transparent',
  }),
  hover: ({ isRead }) => ({
    '&$hover:hover': {
      boxShadow: boxShadow(1),
      background: isRead ? opaqueBlack05 : 'transparent',
    },
  }),
});

export default function SearchResultsTableRow({
  projectMedia, projectMediaUrl, checked, columnDefs, onChangeChecked,
}) {
  const { dbid, is_read: isRead } = projectMedia;
  const classes = useStyles({ dbid, isRead });

  const handleClick = React.useCallback(() => {
    if (!projectMediaUrl) {
      return;
    }
    browserHistory.push(projectMediaUrl);
  }, [projectMediaUrl]);

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
      {columnDefs.map(({ cellComponent: Cell }) => (
        <Cell
          key={Cell.displayName || Cell.name}
          projectMedia={projectMedia}
          projectMediaUrl={projectMediaUrl}
        />
      ))}
    </TableRow>
  );
}
SearchResultsTableRow.defaultProps = {
  projectMediaUrl: null,
};
SearchResultsTableRow.propTypes = {
  columnDefs: PropTypes.arrayOf(PropTypes.shape({
    cellComponent: PropTypes.elementType.isRequired,
  }).isRequired).isRequired,
  projectMedia: PropTypes.shape({
    dbid: PropTypes.number, // or null/0
    is_read: PropTypes.bool,
  }).isRequired,
  projectMediaUrl: PropTypes.string, // or null
  checked: PropTypes.bool.isRequired,
  onChangeChecked: PropTypes.func.isRequired, // onChangeChecked(ev, projectMedia) => undefined
};
