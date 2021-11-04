import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Reorder from '../../layout/Reorder';
import { black16 } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  box: {
    border: `2px solid ${black16}`,
    borderRadius: '5px',
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
    Minheight: theme.spacing(10),
    background: 'white',
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
    <Box display="flex" flexWrap="nowrap" alignItems="center">
      { onMoveUp && onMoveDown ?
        <Reorder
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
          <Typography title={label} variant="body2" className={classes.label}>
            {label}
          </Typography>
          <Typography variant="caption">
            { /^task_value_/.test(key) ?
              <FormattedMessage
                id="teamListsItem.metadata"
                defaultMessage="Annotation"
              /> :
              <FormattedMessage
                id="teamListsItem.general"
                defaultMessage="General"
              /> }
          </Typography>
        </Box>
        <Button color="primary" size="small" onClick={handleToggle} className={classes.button}>
          { show ?
            <FormattedMessage
              id="teamListsItem.hide"
              defaultMessage="Hide"
            /> :
            <FormattedMessage
              id="teamListsItem.show"
              defaultMessage="Show"
            /> }
        </Button>
      </Box>
    </Box>
  );
};

TeamListsItem.defaultProps = {
  isFirst: false,
  isLast: false,
  onMoveUp: null,
  onMoveDown: null,
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
};

export default TeamListsItem;
