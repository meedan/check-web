import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TableCell from '@material-ui/core/TableCell';
import { makeStyles } from '@material-ui/core/styles';
import { checkBlue, inProgressYellow } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  names: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  chip: {
    padding: theme.spacing(1),
    color: 'white',
    fontSize: 12,
    display: 'inline-block',
    borderRadius: theme.spacing(2),
    width: 'auto',
  },
  noFactCheck: {
    background: inProgressYellow,
  },
  more: {
    background: checkBlue,
  },
}));

export default function ClusterTeamsCell({ teamNames, noLabel }) {
  const classes = useStyles();
  if (teamNames.length === 0) {
    return (
      <TableCell className={classes.names}>
        <div className={[classes.chip, classes.noFactCheck].join(' ')}>
          {noLabel}
        </div>
      </TableCell>
    );
  }
  const labels = [];
  let more = 0;
  teamNames.sort(() => Math.random() - 0.5).forEach((name, i) => {
    if (i < 2) {
      labels.push(<div>{name}</div>);
    } else {
      more += 1;
    }
  });
  if (more > 0) {
    labels.push(
      <div className={[classes.chip, classes.more].join(' ')}>
        <FormattedMessage
          id="checkedByTeamsCell.more"
          defaultMessage="+{number} more"
          values={{ number: more }}
          description="Table cell displayed on Trends page showing how many more workspaces fact-checked this item but their names were omitted from display"
        />
      </div>,
    );
  }
  return <TableCell className={classes.names}>{labels}</TableCell>;
}

ClusterTeamsCell.propTypes = {
  teamNames: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  noLabel: PropTypes.object.isRequired,
};
