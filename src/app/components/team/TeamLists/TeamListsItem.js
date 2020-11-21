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
    padding: theme.spacing(3),
    marginBottom: theme.spacing(1),
    marginTop: theme.spacing(1),
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
    frozen,
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
        <Typography variant="body1">
          {label}
        </Typography>
        { !frozen ?
          <Button color="primary" size="small" onClick={handleToggle}>
            { show ?
              <FormattedMessage
                id="teamListsItem.hide"
                defaultMessage="Hide"
              /> :
              <FormattedMessage
                id="teamListsItem.show"
                defaultMessage="Show"
              /> }
          </Button> : null }
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
    frozen: PropTypes.bool.isRequired,
  }).isRequired,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func,
  onMoveDown: PropTypes.func,
};

export default TeamListsItem;
