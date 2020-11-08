import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import TeamListsItem from './TeamListsItem';

const useStyles = makeStyles(theme => ({
  column: {
    marginTop: theme.spacing(2),
  },
}));

const TeamListsColumn = ({
  columns,
  title,
  onToggle,
  onMoveUp,
  onMoveDown,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.column} width="1">
      <Typography variant="subtitle2">
        {title}
      </Typography>
      {columns.map((column, i) => (
        <TeamListsItem
          key={column.key}
          column={column}
          onToggle={onToggle}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          isFirst={i === 0}
          isLast={i === columns.length - 1}
        />
      ))}
    </Box>
  );
};

TeamListsColumn.defaultProps = {
  onMoveUp: null,
  onMoveDown: null,
};

TeamListsColumn.propTypes = {
  title: PropTypes.object.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    index: PropTypes.number.isRequired,
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    frozen: PropTypes.bool.isRequired,
  }).isRequired).isRequired,
  onToggle: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
};

export default TeamListsColumn;
