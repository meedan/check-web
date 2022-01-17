import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  names: {
    whiteSpace: 'wrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export default function ClusterTeamsCell({ projectMedia }) {
  const classes = useStyles();
  const teamNames = projectMedia.cluster_team_names.join(', ');
  return <TableCell className={classes.names}>{teamNames}</TableCell>;
}

ClusterTeamsCell.propTypes = {
  projectMedia: PropTypes.shape({
    cluster_team_names: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  }).isRequired,
};
