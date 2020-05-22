import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages } from 'react-intl';
import RuleToolbar from './RuleToolbar';
import RuleBody from './RuleBody';

const messages = defineMessages({
  copyOf: {
    id: 'rule.copyOf',
    defaultMessage: 'Copy of {ruleName}',
  },
});

const Rule = (props) => {
  const propRule = JSON.parse(JSON.stringify(props.rules[props.index]));
  const [index, setIndex] = React.useState(props.index);
  const [rule, setRule] = React.useState(propRule);
  const [savedRule, setSavedRule] = React.useState(propRule.created_at ? propRule : null);

  React.useEffect(() => {
    setIndex(props.index);
  }, [props.index]);
  React.useEffect(() => {
    const newPropRule = JSON.parse(JSON.stringify(props.rules[index]));
    setRule(newPropRule);
  }, [props.rules]);

  const handleGoBack = () => {
    const rules = props.rules.slice(0);
    if (!savedRule) {
      rules.splice(index, 1);
      setRule(null);
    } else {
      rules[index] = savedRule;
      setRule(savedRule);
    }
    props.onUpdateRules(rules, false);
    props.onSetCurrentRuleIndex(null);
  };

  const handleSave = () => {
    const updatedRule = JSON.parse(JSON.stringify(rule));
    if (!updatedRule.created_at) {
      updatedRule.created_at = parseInt(new Date().getTime() / 1000, 10);
    }
    const rules = props.rules.slice(0);
    rules[index] = updatedRule;
    setRule(updatedRule);
    setSavedRule(updatedRule);
    props.onUpdateRules(rules);
    props.onSetCurrentRuleIndex(null);
  };

  const handleDuplicateRule = () => {
    const rules = props.rules.slice(0);
    const dupRule = JSON.parse(JSON.stringify(rule));
    if (dupRule.created_at) {
      dupRule.name = props.intl.formatMessage(messages.copyOf, { ruleName: rule.name });
      dupRule.created_at = parseInt(new Date().getTime() / 1000, 10);
      rules.push(dupRule);
      const newIndex = rules.length - 1;
      setSavedRule(dupRule);
      setRule(dupRule);
      setIndex(newIndex);
      props.onUpdateRules(rules);
      props.onSetCurrentRuleIndex(newIndex);
    }
  };

  const handleDeleteRule = () => {
    const rules = props.rules.slice(0);
    rules.splice(index, 1);
    setRule(null);
    props.onUpdateRules(rules);
    props.onSetCurrentRuleIndex(null);
  };

  const handleUpdateRule = (updatedRule) => {
    setRule(updatedRule);
  };

  return (
    <React.Fragment>
      <RuleToolbar
        unsavedChanges={JSON.stringify(rule) !== JSON.stringify(savedRule)}
        actionsDisabled={!rule.created_at}
        onGoBack={handleGoBack}
        onSave={handleSave}
        onDuplicateRule={handleDuplicateRule}
        onDeleteRule={handleDeleteRule}
      />
      <RuleBody
        schema={props.schema}
        rule={rule}
        onUpdateRule={handleUpdateRule}
      />
    </React.Fragment>
  );
};

Rule.propTypes = {
  rules: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
  index: PropTypes.number.isRequired,
  schema: PropTypes.object.isRequired,
  onSetCurrentRuleIndex: PropTypes.func.isRequired,
  onUpdateRules: PropTypes.func.isRequired,
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

export default injectIntl(Rule);
