import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import { checkBlue, inProgressYellow, opaqueBlack23 } from '../../../styles/js/shared';
import RuleOperatorWrapper from './RuleOperatorWrapper';
import RuleField from './RuleField';

const useStyles = makeStyles(theme => ({
  paper: {
    width: '100%',
    padding: theme.spacing(2),
    boxShadow: 'none',
  },
  ifGroup: {
    border: `2px solid ${inProgressYellow}`,
  },
  thenGroup: {
    border: `2px solid ${checkBlue}`,
  },
  ifTitle: {
    color: inProgressYellow,
  },
  thenTitle: {
    color: checkBlue,
  },
  paper2: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  title: {
    textTransform: 'uppercase',
  },
  box: {
    border: `2px solid ${opaqueBlack23}`,
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    borderRadius: 4,
  },
}));

const RuleBody = (props) => {
  const classes = useStyles();
  const [rule, setRule] = React.useState(JSON.parse(JSON.stringify(props.rule)));
  const [ruleName, setRuleName] = React.useState(rule.name);

  React.useEffect(() => {
    setRule(JSON.parse(JSON.stringify(props.rule)));
    setRuleName(props.rule.name);
  }, [props.rule]);

  const handleChangeRuleName = (event) => {
    setRuleName(event.target.value);
  };

  const handleUpdateRuleName = (event) => {
    rule.name = event.target.value;
    props.onUpdateRule(rule);
  };

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

  return (
    <Paper className={classes.paper}>
      <TextField
        value={ruleName}
        error={!ruleName}
        helperText={
          <FormattedMessage
            id="ruleBody.ruleNameValidation"
            defaultMessage="Rule name is required"
          />
        }
        label={
          <FormattedMessage
            id="ruleBody.ruleName"
            defaultMessage="Name"
          />
        }
        onChange={handleChangeRuleName}
        onBlur={handleUpdateRuleName}
        fullWidth
      />
      <RuleOperatorWrapper
        center
        color={inProgressYellow}
        deleteIconColor={inProgressYellow}
        operator={rule.rules.operator}
        onSetOperator={(value) => {
          rule.rules.operator = value;
          props.onUpdateRule(rule);
        }}
        onAdd={() => {
          rule.rules.groups.push({ operator: 'and', conditions: [{ rule_definition: '', rule_value: '' }] });
          props.onUpdateRule(rule);
        }}
        onRemove={(i) => {
          rule.rules.groups.splice(i, 1);
          props.onUpdateRule(rule);
        }}
      >
        {rule.rules.groups.map((group, i) => {
          const rulesDefinition = props.schema.properties.rules.items.properties.rules
            .properties.groups.items.properties.conditions.items.properties.rule_definition;
          return (
            <Paper className={[classes.paper, classes.paper2, classes.ifGroup].join(' ')} key={Math.random().toString().substring(2, 10)}>
              <Typography className={[classes.title, classes.ifTitle].join(' ')} component="div" variant="subtitle1">
                <FormattedMessage
                  id="ruleBody.if"
                  defaultMessage="If"
                />
              </Typography>
              <RuleOperatorWrapper
                center={false}
                color={inProgressYellow}
                operator={group.operator}
                onSetOperator={(value) => {
                  rule.rules.groups[i].operator = value;
                  props.onUpdateRule(rule);
                }}
                onAdd={() => {
                  rule.rules.groups[i].conditions.push({ rule_definition: '', rule_value: '' });
                  props.onUpdateRule(rule);
                }}
                onRemove={(j) => {
                  rule.rules.groups[i].conditions.splice(j, 1);
                  props.onUpdateRule(rule);
                }}
              >
                {group.conditions.map((condition, j) => {
                  const conditions = props.schema.properties.rules.items.properties.rules
                    .properties.groups.items.properties.conditions.items.allOf;
                  const conditionalField = getConditionalField(conditions, 'rule_definition', condition.rule_definition);

                  return (
                    <Box key={Math.random().toString().substring(2, 10)} className={classes.box}>
                      <RuleField
                        definition={rulesDefinition}
                        value={condition.rule_definition}
                        onChange={(value) => {
                          rule.rules.groups[i].conditions[j].rule_definition = value;
                          rule.rules.groups[i].conditions[j].rule_value = '';
                          props.onUpdateRule(rule);
                        }}
                      />
                      { conditionalField ?
                        <RuleField
                          definition={conditionalField.rule_value}
                          value={condition.rule_value}
                          onChange={(value) => {
                            rule.rules.groups[i].conditions[j].rule_value = value;
                            props.onUpdateRule(rule);
                          }}
                        /> : null }
                    </Box>
                  );
                })}
              </RuleOperatorWrapper>
            </Paper>
          );
        })}
      </RuleOperatorWrapper>
      <Paper className={[classes.paper, classes.paper2, classes.thenGroup, 'rules__actions'].join(' ')}>
        <Typography className={[classes.title, classes.thenTitle].join(' ')} component="div" variant="subtitle1">
          <FormattedMessage
            id="ruleBody.then"
            defaultMessage="Then"
          />
        </Typography>
        <RuleOperatorWrapper
          center={false}
          color={checkBlue}
          operator="and"
          operators={['and']}
          onSetOperator={() => {}}
          onAdd={() => {
            rule.actions.push({ action_definition: '', action_value: '' });
            props.onUpdateRule(rule);
          }}
          onRemove={(i) => {
            rule.actions.splice(i, 1);
            props.onUpdateRule(rule);
          }}
        >
          {rule.actions.map((action, i) => {
            const actions = props.schema.properties.rules.items.properties.actions.items;
            const actionsDefinition = actions.properties.action_definition;
            const conditionalField = getConditionalField(actions.allOf, 'action_definition', action.action_definition);
            return (
              <Box key={Math.random().toString().substring(2, 10)} className={classes.box}>
                <RuleField
                  definition={actionsDefinition}
                  value={action.action_definition}
                  onChange={(value) => {
                    rule.actions[i].action_definition = value;
                    rule.actions[i].action_value = '';
                    props.onUpdateRule(rule);
                  }}
                />
                { conditionalField ?
                  <RuleField
                    definition={conditionalField.action_value}
                    value={action.action_value}
                    onChange={(value) => {
                      rule.actions[i].action_value = value;
                      props.onUpdateRule(rule);
                    }}
                  /> : null }
              </Box>
            );
          })}
        </RuleOperatorWrapper>
      </Paper>
    </Paper>
  );
};

RuleBody.propTypes = {
  rule: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  onUpdateRule: PropTypes.func.isRequired,
};

export default RuleBody;
