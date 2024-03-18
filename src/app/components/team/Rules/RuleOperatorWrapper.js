import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import AddIcon from '../../../icons/add.svg';
import ClearIcon from '../../../icons/clear.svg';
import RuleOperatorButton from './RuleOperatorButton';
import styles from './Rules.module.css';

const RuleOperatorWrapper = (props) => {
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
          <div className={styles['rule-operator-wrapper']}>
            { index === props.children.length - 1 ?
              <>
                { props.onAdd ? (
                  <ButtonMain
                    label={<FormattedMessage id="ruleOperatorWrapper.add" defaultMessage="Add Condition" description="Button label for the user to add another if/then condition to this rule" />}
                    iconLeft={<AddIcon />}
                    variant="contained"
                    theme="text"
                    size="small"
                    onClick={handleAdd}
                  />
                ) : null }
              </>
              :
              <>
                { props.operators.map((operator, index2) => (
                  <React.Fragment key={operator}>
                    <RuleOperatorButton
                      value={operator}
                      currentValue={props.operator}
                      onClick={() => { handleChangeOperator(operator); }}
                    >
                      {operatorLabels[operator]}
                    </RuleOperatorButton>
                    { props.operators.length - 1 === index2 ? null : (<Typography component="span"> | </Typography>) }
                  </React.Fragment>
                ))}
              </>
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
          </div>
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
  operator: PropTypes.string,
  operators: PropTypes.arrayOf(PropTypes.string),
  deleteIconColor: PropTypes.string,
  onSetOperator: PropTypes.func,
  onAdd: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default RuleOperatorWrapper;
