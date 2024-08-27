/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import { ToggleButton, ToggleButtonGroup } from '../../cds/inputs/ToggleButtonGroup';
import AddIcon from '../../../icons/add.svg';
import ClearIcon from '../../../icons/clear.svg';
import styles from './Rules.module.css';

const RuleOperatorWrapper = (props) => {
  const handleChangeOperator = (value) => {
    if (value !== null) {
      props.onSetOperator(value);
    }
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
    and: <FormattedMessage defaultMessage="And" description="'and' logical operator choice for a rule step" id="ruleOperatorWrapper.and" />,
    or: <FormattedMessage defaultMessage="Or" description="'or' logical operator choice for a rule step" id="ruleOperatorWrapper.or" />,
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
                    iconLeft={<AddIcon />}
                    label={<FormattedMessage defaultMessage="Add Condition" description="Button label for the user to add another if/then condition to this rule" id="ruleOperatorWrapper.add" />}
                    size="small"
                    theme="text"
                    variant="contained"
                    onClick={handleAdd}
                  />
                ) : null }
              </>
              :
              <ToggleButtonGroup
                exclusive
                size="small"
                value={props.operator}
                variant="contained"
                onChange={(e, newValue) => handleChangeOperator(newValue)}
              >
                { props.operators.map(operator => (
                  <ToggleButton key={operator} value={operator}>
                    {operatorLabels[operator]}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            }
            { props.children.length > 1 || props.allowRemove ? (
              <Tooltip
                arrow
                title={
                  <FormattedMessage defaultMessage="Remove item above" description="Button to remove a new rule operator" id="ruleOperatorWrapper.removeTheAbove" />
                }
              >
                <span>
                  <ButtonMain
                    iconCenter={<ClearIcon style={{ color: props.deleteIconColor }} />}
                    size="default"
                    theme="lightText"
                    variant="text"
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
  deleteIconColor: 'var(--color-gray-37)',
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
