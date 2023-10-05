import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Reorder from '../../layout/Reorder';

const useStyles = makeStyles(theme => ({
  box: {
    border: '2px solid var(--grayBorderMain)',
    borderRadius: '5px',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    minHeight: theme.spacing(10),
    background: 'var(--otherWhite)',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    width: '10rem',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  button: {
    fontSize: 12,
    fontWeight: 'normal',
  },
}));

const TeamListsItem = ({
  column,
  isFirst,
  isLast,
  onToggle,
  onMoveUp,
  onMoveDown,
  isRequired,
}) => {
  const {
    index,
    key,
    label,
    show,
  } = column;
  const classes = useStyles();

  const handleToggle = () => {
    onToggle(key, index);
  };

  const handleMoveUp = () => {
    onMoveUp(key, index);
  };

  const handleMoveDown = () => {
    onMoveDown(key, index);
  };

  return (
    <Box display="flex" flexWrap="nowrap" alignItems="center" style={{ gap: '4px', padding: '2px' }}>
      { onMoveUp && onMoveDown ?
        <Reorder
          variant="vertical"
          theme="white"
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          disableUp={isFirst}
          disableDown={isLast}
        /> : null }
      <Box
        id={`team-lists__item-${index}-${key}`}
        className={classes.box}
        display="flex"
        width="1"
        alignItems="center"
        justifyContent="space-between"
      >
        <Box>
          <Typography title={label} variant="body1" className={classes.label}>
            {label}
          </Typography>
          <Typography variant="caption">
            { /^task_value_/.test(key) ?
              <FormattedMessage
                id="teamListsItem.metadata"
                defaultMessage="Annotation"
                description="label to show that this type of task is an annotation"
              /> :
              <FormattedMessage
                id="teamListsItem.general"
                defaultMessage="General"
                description="label to show that this type of task is a general task"
              /> }
          </Typography>
        </Box>
        {
          isRequired ?
            null :
            <Button color="primary" size="small" onClick={handleToggle} className={['test__list-toggle', classes.button].join(' ')}>
              { show ?
                <FormattedMessage
                  id="teamListsItem.hide"
                  defaultMessage="Hide"
                  description="Button label to hide this item from the list"
                /> :
                <FormattedMessage
                  id="teamListsItem.show"
                  defaultMessage="Show"
                  description="Button label to show this item in the list"
                /> }
            </Button>
        }
      </Box>
    </Box>
  );
};

TeamListsItem.defaultProps = {
  isFirst: false,
  isLast: false,
  onMoveUp: null,
  onMoveDown: null,
  isRequired: false,
};

TeamListsItem.propTypes = {
  column: PropTypes.shape({
    index: PropTypes.number.isRequired,
    key: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
  }).isRequired,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
  isRequired: PropTypes.bool,
};

export default TeamListsItem;
