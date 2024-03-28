import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import AddCircleIcon from '../../../icons/add_circle.svg';
import ClearIcon from '../../../icons/clear.svg';
import RuleOperatorButton from './RuleOperatorButton';

const useStyles = makeStyles(() => ({
  separator: {
    color: 'var(--textSecondary)',
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
    and: <FormattedMessage id="ruleOperatorWrapper.and" defaultMessage="And" description="'and' logical operator choice for a rule step" />,
    or: <FormattedMessage id="ruleOperatorWrapper.or" defaultMessage="Or" description="'or' logical operator choice for a rule step" />,
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
                  <ButtonMain
                    iconCenter={<AddCircleIcon style={{ color: props.color }} />}
                    variant="text"
                    theme="brand"
                    size="default"
                    onClick={handleAdd}
                  />
                ) : null }
              </Box> :
              <Box display="flex" alignItems="center">
                { props.operators.map((operator, index2) => (
                  <React.Fragment key={operator}>
                    <RuleOperatorButton
                      value={operator}
                      currentValue={props.operator}
                      onClick={() => { handleChangeOperator(operator); }}
                    >
                      {operatorLabels[operator]}
                    </RuleOperatorButton>
                    { props.operators.length - 1 === index2 ? null : (<Typography className={classes.separator} component="span"> | </Typography>) }
                  </React.Fragment>
                ))}
              </Box>
            }
            { props.children.length > 1 || props.allowRemove ? (
              <Tooltip
                arrow
                title={
                  <FormattedMessage id="ruleOperatorWrapper.removeTheAbove" defaultMessage="Remove item above" description="Button to remove a new rule operator" />
                }
              >
                <span>
                  <ButtonMain
                    iconCenter={<ClearIcon style={{ color: props.deleteIconColor }} />}
                    variant="text"
                    theme="lightText"
                    size="default"
                    onClick={() => { handleRemove(index); }}
                  />
                </span>
              </Tooltip>
            ) : null }
          </Box>
        </React.Fragment>))}
    </React.Fragment>
  );
};

RuleOperatorWrapper.defaultProps = {
  allowRemove: false,
  operator: 'and',
  operators: ['and', 'or'],
  deleteIconColor: 'var(--textSecondary)',
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
