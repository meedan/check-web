import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import Checkbox from '@material-ui/core/Checkbox';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';
import { opaqueBlack03 } from '../../../styles/js/shared';

const swallowClick = (ev) => {
  // prevent <TableRow onClick> from firing when we check the checkbox
  ev.stopPropagation();
};

const useStyles = makeStyles({
  root: ({ dbid, isRead }) => ({
    cursor: dbid ? 'pointer' : 'auto',
    background: isRead ? opaqueBlack03 : 'transparent',
  }),
  hover: ({ isRead }) => ({
    '&$hover:hover': {
      boxShadow: '0px 1px 6px rgba(0, 0, 0, 0.25)',
      background: isRead ? opaqueBlack03 : 'transparent',
      transform: 'scale(1)',
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

  // FIXME: Mutation a prop! But how to return a JSON object in an optimistic response?
  if (typeof projectMedia.list_columns_values === 'string') {
    // eslint-disable-next-line no-param-reassign
    projectMedia.list_columns_values = JSON.parse(projectMedia.list_columns_values);
  }

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
        { !projectMedia.is_secondary ? <Checkbox checked={checked} onChange={handleChangeChecked} /> : null }
      </TableCell>
      {columnDefs.map(({ cellComponent: Cell, field, type }) => (
        <Cell
          key={field}
          field={field}
          type={type}
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
    is_read: PropTypes.bool, // or null
    is_secondary: PropTypes.bool, // or null
  }).isRequired,
  projectMediaUrl: PropTypes.string, // or null
  checked: PropTypes.bool.isRequired,
  onChangeChecked: PropTypes.func.isRequired, // onChangeChecked(ev, projectMedia) => undefined
};
