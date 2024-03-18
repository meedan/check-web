import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import TextField from '../../cds/inputs/TextField';
import RuleOperatorWrapper from './RuleOperatorWrapper';
import RuleField from './RuleField';
import styles from './Rules.module.css';

const RuleBody = (props) => {
  const rule = JSON.parse(JSON.stringify(props.rule));

  const getConditionalField = (conditions, key, value) => {
    let conditionalField = null;
    conditions.forEach((condition) => {
      if (
        condition.if.properties[key].const === value ||
        (condition.if.properties[key].enum && condition.if.properties[key].enum.indexOf(value) > -1)
      ) {
        conditionalField = condition.then.properties;
      }
    });
    return conditionalField;
  };

  const handleUpdateRuleName = (e) => {
    rule.name = e.target.value;
    props.onChangeRule(rule);
  };

  return (
    <div className={styles['rule-wrapper']}>
      { !props.hideName ?
        <FormattedMessage id="ruleBody.namePlaceholder" defaultMessage="Enter a descriptive rule name" description="Text field placeholder for the input name of rule" >
          { placeholder => (
            <TextField
              className={styles['rule-name']}
              key={rule.name}
              name="rule-name"
              defaultValue={rule.name}
              label={
                <FormattedMessage
                  id="ruleBody.ruleName"
                  defaultMessage="Rule Name"
                  description="Text field label for the rule name"
                />
              }
              placeholder={placeholder}
              onBlur={handleUpdateRuleName}
              required
            />
          )}
        </FormattedMessage>
        : null
      }
      <RuleOperatorWrapper
        allowRemove={Boolean(props.onResetRule)}
        operator={rule.rules.operator}
        onSetOperator={(value) => {
          rule.rules.operator = value;
          props.onChangeRule(rule);
        }}
        onAdd={() => {
          rule.rules.groups.push({ operator: 'and', conditions: [{ rule_definition: '', rule_value: '' }] });
          props.onChangeRule(rule);
        }}
        onRemove={(i) => {
          if (rule.rules.groups.length === 1 && props.onResetRule) {
            props.onResetRule();
          } else {
            rule.rules.groups.splice(i, 1);
            props.onChangeRule(rule);
          }
        }}
      >
        {rule.rules.groups.map((group, i) => {
          const rulesDefinition = props.schema.properties.rules.items.properties.rules
            .properties.groups.items.properties.conditions.items.properties.rule_definition;
          return (
            <div
              className={styles['rule-if-group']}
              key={Math.random().toString().substring(2, 10)}
            >
              <div className={styles['rule-if-title']}>
                <FormattedMessage
                  id="ruleBody.if"
                  defaultMessage="If"
                  description="Logical operator IF statement label"
                />
              </div>
              <RuleOperatorWrapper
                operator={group.operator}
                onSetOperator={(value) => {
                  rule.rules.groups[i].operator = value;
                  props.onChangeRule(rule);
                }}
                onAdd={() => {
                  rule.rules.groups[i].conditions.push({ rule_definition: '', rule_value: '' });
                  props.onChangeRule(rule);
                }}
                onRemove={(j) => {
                  rule.rules.groups[i].conditions.splice(j, 1);
                  props.onChangeRule(rule);
                }}
              >
                {group.conditions.map((condition, j) => {
                  const conditions = props.schema.properties.rules.items.properties.rules
                    .properties.groups.items.properties.conditions.items.allOf;
                  const conditionalField = getConditionalField(conditions, 'rule_definition', condition.rule_definition);

                  return (
                    <div
                      key={Math.random().toString().substring(2, 10)}
                      className={styles['rule-field-wrapper']}
                    >
                      <RuleField
                        definition={rulesDefinition}
                        value={condition.rule_definition}
                        onChange={(value) => {
                          rule.rules.groups[i].conditions[j].rule_definition = value;
                          rule.rules.groups[i].conditions[j].rule_value = '';
                          props.onChangeRule(rule);
                        }}
                      />
                      { conditionalField ?
                        <RuleField
                          definition={conditionalField.rule_value}
                          value={condition.rule_value}
                          onChange={(value) => {
                            rule.rules.groups[i].conditions[j].rule_value = value;
                            props.onChangeRule(rule);
                          }}
                        /> : null }
                    </div>
                  );
                })}
              </RuleOperatorWrapper>
            </div>
          );
        })}
      </RuleOperatorWrapper>
      { !props.hideActions ?
        <div className={cx('rules__actions', styles['rule-then-group'])}>
          <div className={styles['rule-then-title']}>
            <FormattedMessage
              id="ruleBody.then"
              defaultMessage="Then"
              description="Logical operator THEN statement"
            />
          </div>
          <RuleOperatorWrapper
            operator="and"
            operators={['and']}
            onSetOperator={() => {}}
            onAdd={() => {
              rule.actions.push({ action_definition: '', action_value: '' });
              props.onChangeRule(rule);
            }}
            onRemove={(i) => {
              rule.actions.splice(i, 1);
              props.onChangeRule(rule);
            }}
          >
            {rule.actions.map((action, i) => {
              const actions = props.schema.properties.rules.items.properties.actions.items;
              const actionsDefinition = actions.properties.action_definition;
              actionsDefinition.enum = actionsDefinition.enum.filter(a => a.key !== 'add_tag' && a.key !== 'move_to_project');
              const conditionalField = getConditionalField(actions.allOf, 'action_definition', action.action_definition);
              return (
                <div
                  key={Math.random().toString().substring(2, 10)}
                  className={styles['rule-field-wrapper']}
                >
                  <RuleField
                    definition={actionsDefinition}
                    value={action.action_definition}
                    onChange={(value) => {
                      rule.actions[i].action_definition = value;
                      rule.actions[i].action_value = '';
                      props.onChangeRule(rule);
                    }}
                  />
                  { conditionalField ?
                    <RuleField
                      definition={conditionalField.action_value}
                      value={action.action_value}
                      onChange={(value) => {
                        rule.actions[i].action_value = value;
                        props.onChangeRule(rule);
                      }}
                    /> : null }
                </div>
              );
            })}
          </RuleOperatorWrapper>
        </div> : null }
    </div>
  );
};

RuleBody.defaultProps = {
  hideName: false,
  hideActions: false,
};

RuleBody.propTypes = {
  rule: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  hideName: PropTypes.bool,
  hideActions: PropTypes.bool,
  onChangeRule: PropTypes.func.isRequired,
};

export default RuleBody;
