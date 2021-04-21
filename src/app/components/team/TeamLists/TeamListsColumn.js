import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import TeamListsItem from './TeamListsItem';
import { black54 } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  column: {
    marginTop: theme.spacing(2),
  },
  innerColumn: {
    padding: '.3rem 0 1rem 1rem',
    border: '1px solid transparent', // To match column of teamListComponent.js
  },
  placeholder: {
    color: black54,
    textAlign: 'center',
  },
  columnTitle: {
    marginLeft: '1rem',
    marginBottom: '1rem',
  },
}));

const TeamListsColumn = ({
  columns,
  title,
  onToggle,
  onMoveUp,
  onMoveDown,
  style,
  placeholder,
}) => {
  const classes = useStyles();

  return (
    <Box className={classes.column} width="1">
      <Typography className={classes.columnTitle} variant="subtitle2">
        {title}
      </Typography>
      <Box className={classes.innerColumn} style={style}>
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
        { columns.length === 0 ?
          <Box className={classes.placeholder}>
            {placeholder}
          </Box> : null }
      </Box>
    </Box>
  );
};

TeamListsColumn.defaultProps = {
  onMoveUp: null,
  onMoveDown: null,
  style: {},
  placeholder: (
    <FormattedMessage
      id="teamListsColumn.none"
      defaultMessage="None available"
      description="Placeholder text when there are no columns left for selection when the user is customizing which ones they want to show or hide"
    />
  ),
};

TeamListsColumn.propTypes = {
  title: PropTypes.node.isRequired,
  columns: PropTypes.arrayOf(PropTypes.shape({
    index: PropTypes.number.isRequired,
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
  }).isRequired).isRequired,
  onToggle: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
  style: PropTypes.object,
  placeholder: PropTypes.node,
};

export default TeamListsColumn;
