import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import ValueListCell from './ValueListCell';
import { urlFromSearchQuery } from '../../search/Search';
import { safelyParseJSON } from '../../../helpers';
import { checkBlue } from '../../../styles/js/shared';

const useStyles = makeStyles({
  source: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    color: checkBlue,
    textDecoration: 'underline',
  },
});

export default function SourcesCell({ projectMedia }) {
  const classes = useStyles();

  const searchBySource = (e) => {
    const { source_id: sourceId, team } = projectMedia;
    const sourceMediasLink = urlFromSearchQuery({ sources: [`${sourceId}`] }, `/${team.slug}/all-items`);
    const newWindow = window.open(sourceMediasLink, '_blank', 'noopener,noreferrer');
    if (newWindow) newWindow.opener = null;
    e.stopPropagation();
    e.preventDefault();
  };

  const sources = safelyParseJSON(projectMedia.list_columns_values.sources_as_sentence) || {};

  return (
    <ValueListCell
      onClick={searchBySource}
      values={Object.values(sources).map(source => (
        <div className={classes.source}>{source}</div>
      ))}
      noValueLabel="-"
    />
  );
}

SourcesCell.propTypes = {
  projectMedia: PropTypes.shape({
    source_id: PropTypes.number.isRequired,
    team: PropTypes.shape({
      slug: PropTypes.string.isRequired,
    }).isRequired,
    list_columns_values: PropTypes.shape({
      sources_as_sentence: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
