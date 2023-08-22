import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import TeamListsItem from './TeamListsItem';

const useStyles = makeStyles({
  innerColumn: {
    padding: '.3rem 0 1rem 1rem',
    margin: '16px 0 0',
  },
  placeholder: {
    color: 'var(--textSecondary)',
    textAlign: 'center',
  },
});

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
    <Box width="1">
      <span className="typography-subtitle2">
        {title}
      </span>
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
            isRequired={column.key === 'created_at_timestamp'}
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
