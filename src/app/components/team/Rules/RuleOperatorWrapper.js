import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import ClearIcon from '@material-ui/icons/Clear';
import { makeStyles } from '@material-ui/core/styles';
import { black54 } from '../../../styles/js/shared';
import RuleOperatorButton from './RuleOperatorButton';

const useStyles = makeStyles(() => ({
  separator: {
    color: black54,
  },
  button: {
    padding: 0,
  },
}));

const RuleOperatorWrapper = (props) => {
  const classes = useStyles();

  const handleChangeOperator = (value) => {
    props.onSetOperator(value);
  };

  const handleAdd = () => {
    props.onAdd();
  };

  const handleRemove = (i) => {
    if (props.children.length > 1 || props.allowRemove) {
      props.onRemove(i);
    }
  };

  const operatorLabels = {
    and: <FormattedMessage id="ruleOperatorWrapper.and" defaultMessage="And" />,
    or: <FormattedMessage id="ruleOperatorWrapper.or" defaultMessage="Or" />,
  };

  return (
    <React.Fragment>
      {props.children.map((child, index) => (
        <React.Fragment key={Math.random().toString().substring(2, 10)}>
          {child}
          <Box display="flex" justifyContent="space-between" className={classes.box}>
            { index === props.children.length - 1 ?
              <Box justifyContent={props.center ? 'center' : null} display="flex">
                { props.onAdd ? (
                  <IconButton onClick={handleAdd} className={classes.button}>
                    <AddCircleOutlineIcon style={{ color: props.color }} />
                  </IconButton>
                ) : null }
              </Box> :
              <Box>
                { props.operators.map((operator, index2) => (
                  <React.Fragment key={operator}>
                    <RuleOperatorButton
                      value={operator}
                      currentValue={props.operator}
                      onClick={() => { handleChangeOperator(operator); }}
                      color={props.color}
                    >
                      {operatorLabels[operator]}
                    </RuleOperatorButton>
                    { props.operators.length - 1 === index2 ? null : (<Typography className={classes.separator} component="span"> | </Typography>) }
                  </React.Fragment>
                ))}
              </Box>
            }
            <Tooltip
              title={
                <FormattedMessage id="ruleOperatorWrapper.removeTheAbove" defaultMessage="Remove item above" />
              }
            >
              <IconButton onClick={() => { handleRemove(index); }} className={classes.button}>
                <ClearIcon style={{ color: props.deleteIconColor }} />
              </IconButton>
            </Tooltip>
          </Box>
        </React.Fragment>))}
    </React.Fragment>
  );
};

RuleOperatorWrapper.defaultProps = {
  allowRemove: false,
  operator: 'and',
  operators: ['and', 'or'],
  deleteIconColor: black54,
  onSetOperator: null,
};

RuleOperatorWrapper.propTypes = {
  allowRemove: PropTypes.bool,
  center: PropTypes.bool.isRequired,
  operator: PropTypes.string,
  operators: PropTypes.arrayOf(PropTypes.string),
  color: PropTypes.string.isRequired,
  deleteIconColor: PropTypes.string,
  onSetOperator: PropTypes.func,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default RuleOperatorWrapper;
