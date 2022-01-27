import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';
import { urlFromSearchQuery } from '../../search/Search';

const useStyles = makeStyles({
  source: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: 'blue',
    textDecoration: 'underline',
  },
});

function formatSources(value) {
  const sources = value.split(', ');
  const newValue = sources.slice(0, 3);
  if (sources.length > 3) {
    newValue[2] = `${newValue[2]} + ${sources.length - 3}`;
  }
  return newValue;
}

export default function SourcesCell({ projectMedia }) {
  const classes = useStyles();

  const addSourceLink = (e) => {
    const { source_id: sourceId, team } = projectMedia;
    const sourceMediasLink = urlFromSearchQuery({ sources: [`${sourceId}`] }, `/${team.slug}/all-items`);
    const newWindow = window.open(sourceMediasLink, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
    e.stopPropagation();
    e.preventDefault();
  };

  const sources = projectMedia.list_columns_values.sources_as_sentence;
  console.log('sources', sources); // eslint-disable-line no-console

  if (sources === '' || sources === null) {
    return <TableCell>-</TableCell>;
  }

  return (
    <TableCell onClick={addSourceLink}>
      {formatSources(sources).map(source => (
        <div className={classes.source}>{source}</div>
      ))}
    </TableCell>
  );
}

SourcesCell.propTypes = {
  projectMedia: PropTypes.shape({
    list_columns_values: PropTypes.shape({
      sources_as_sentence: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
