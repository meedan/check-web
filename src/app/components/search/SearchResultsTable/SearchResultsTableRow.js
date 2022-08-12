import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import { makeStyles } from '@material-ui/core/styles';
import { opaqueBlack03 } from '../../../styles/js/shared';

const isFeedPage = /\/feed$/.test(window.location.pathname);

const swallowClick = (ev) => {
  // prevent <TableRow onClick> from firing when we check the checkbox
  ev.stopPropagation();
};

const useStyles = makeStyles({
  root: ({ dbid, isRead }) => ({
    cursor: dbid ? 'pointer' : 'wait',
    background: isRead || isFeedPage ? opaqueBlack03 : 'transparent',
    textDecoration: 'none',
  }),
  hover: ({ isRead }) => ({
    '&$hover:hover': {
      boxShadow: '0px 1px 6px rgba(0, 0, 0, 0.25)',
      background: isRead || isFeedPage ? opaqueBlack03 : 'transparent',
      transform: 'scale(1)',
    },
  }),
});

export default function SearchResultsTableRow({
  projectMedia, projectMediaUrl, checked, columnDefs, onChangeChecked, resultType, viewMode,
}) {
  const { dbid, is_read: isRead } = projectMedia;
  const classes = useStyles({ dbid, isRead });

  // This is why we don't get a listIndex in our feed item url
  // We are forcing the url instead of getting it from `projectMediaUrl` which is built from `buildProjectMediaUrl`
  const projectMediaOrFeedUrl = projectMediaUrl;

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
  if (resultType === 'factCheck') {
    // eslint-disable-next-line no-param-reassign
    projectMedia.list_columns_values = projectMedia.feed_columns_values;
  }

  return (
    <TableRow
      aria-checked={checked}
      selected={checked}
      classes={classes}
      className="medias__item" // for integration tests
      hover={!!dbid} // only allow hover when clickable
    >
      { (resultType !== 'feed' && resultType !== 'factCheck') ? (
        <TableCell padding="checkbox" onClick={swallowClick}>
          { !projectMedia.is_secondary ? <Checkbox checked={checked} onChange={handleChangeChecked} /> : null }
        </TableCell>
      ) : null
      }
      {columnDefs.map(({ cellComponent: Cell, field, type }) => (
        <Cell
          key={field}
          field={field}
          type={type}
          projectMedia={projectMedia}
          projectMediaUrl={projectMediaOrFeedUrl}
          viewMode={viewMode}
        />
      ))}
    </TableRow>
  );
}
SearchResultsTableRow.defaultProps = {
  projectMediaUrl: null,
  resultType: 'default',
  viewMode: 'shorter',
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
  viewMode: PropTypes.oneOf(['shorter', 'longer']),
  resultType: PropTypes.string,
};
