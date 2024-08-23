/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import { graphql, commitMutation } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import Rule from './Rule';
import RulesTable from './RulesTable';
import { safelyParseJSON } from '../../../helpers';
import { withSetFlashMessage } from '../../FlashMessage';

const messages = defineMessages({
  copyOf: {
    id: 'rule.copyOf',
    defaultMessage: 'Copy of {ruleName}',
  },
});

const RulesComponent = (props) => {
  const propRules = props.team.get_rules ? props.team.get_rules.slice(0) : [];
  const [rules, setRules] = React.useState(JSON.parse(JSON.stringify(propRules)));
  const [currentRuleIndex, setCurrentRuleIndex] = React.useState(null);
  const rule = currentRuleIndex !== null ? rules[currentRuleIndex] : null;
  const [savedRule, setSavedRule] = React.useState(null);

  const handleError = (error) => {
    let errorMessage = <FormattedMessage defaultMessage="Could not save rules" description="Error message when rule cannot be saved" id="rulesComponent.defaultErrorMessage" />;
    const json = safelyParseJSON(error.source);
    if (json && json.errors && json.errors[0] && json.errors[0].message) {
      errorMessage = json.errors[0].message;
    }
    props.setFlashMessage(errorMessage, 'error');
  };

  const handleSuccess = () => {
    props.setFlashMessage(<FormattedMessage defaultMessage="Rules saved successfully" description="Success message when rule has saved" id="rulesComponent.savedSuccessfully" />, 'success');
  };

  const handleUpdateRules = (newRules, commit) => {
    setRules(newRules);
    if (commit) {
      commitMutation(Store, {
        mutation: graphql`
          mutation RulesComponentUpdateTeamMutation($input: UpdateTeamInput!) {
            updateTeam(input: $input) {
              team {
                id
                get_rules
              }
            }
          }
        `,
        variables: {
          input: {
            id: props.team.id,
            rules: JSON.stringify(newRules),
          },
        },
        onCompleted: (response, error) => {
          if (error) {
            handleError(error);
          } else {
            handleSuccess();
          }
        },
        onError: (error) => {
          handleError(error);
        },
      });
    }
  };

  const handleGoBack = () => {
    const updatedRules = rules.slice(0);
    if (!savedRule) {
      updatedRules.splice(currentRuleIndex, 1);
    } else {
      updatedRules[currentRuleIndex] = JSON.parse(JSON.stringify(savedRule));
    }
    setSavedRule(null);
    setCurrentRuleIndex(null);
    handleUpdateRules(updatedRules, false);
  };

  const handleClickRule = (index) => {
    setSavedRule(JSON.parse(JSON.stringify(rules[index])));
    setCurrentRuleIndex(index);
  };

  const handleDuplicateRule = () => {
    const updatedRules = rules.slice(0);
    const dupRule = JSON.parse(JSON.stringify(rule));
    dupRule.name = props.intl.formatMessage(messages.copyOf, { ruleName: rule.name });
    dupRule.updated_at = parseInt(new Date().getTime() / 1000, 10);
    updatedRules.push(dupRule);
    setCurrentRuleIndex(updatedRules.length - 1);
    handleUpdateRules(updatedRules, true);
    setSavedRule(dupRule);
  };

  const handleDeleteRule = () => {
    const updatedRules = rules.slice(0);
    updatedRules.splice(currentRuleIndex, 1);
    handleUpdateRules(updatedRules, true);
    setCurrentRuleIndex(null);
  };

  const handleAddRule = () => {
    const updatedRules = rules.slice(0);
    const newRule = {
      name: '',
      updated_at: null,
      rules: {
        operator: 'and',
        groups: [
          {
            operator: 'and',
            conditions: [
              {
                rule_definition: '',
                rule_value: '',
              },
            ],
          },
        ],
      },
      actions: [
        {
          action_definition: '',
          action_value: '',
        },
      ],
    };
    setSavedRule(null);
    updatedRules.push(newRule);
    handleUpdateRules(updatedRules, false);
    setCurrentRuleIndex(updatedRules.length - 1);
  };

  const handleDeleteRules = (indexes) => {
    const updatedRules = rules.slice(0);
    indexes.forEach((index) => { updatedRules.splice(index, 1); });
    handleUpdateRules(updatedRules, true);
  };

  const handleSaveRule = () => {
    const updatedRule = JSON.parse(JSON.stringify(rule));
    updatedRule.updated_at = parseInt(new Date().getTime() / 1000, 10);
    const updatedRules = rules.slice(0);
    updatedRules[currentRuleIndex] = updatedRule;
    handleUpdateRules(updatedRules, true);
    setCurrentRuleIndex(null);
  };

  const handleChangeRule = (updatedRule) => {
    const updatedRules = rules.slice(0);
    updatedRules[currentRuleIndex] = updatedRule;
    handleUpdateRules(updatedRules, false);
  };

  if (currentRuleIndex !== null && rule !== null) {
    return (
      <Rule
        rule={rule}
        schema={JSON.parse(props.team.rules_json_schema)}
        unsavedChanges={JSON.stringify(rule) !== JSON.stringify(savedRule)}
        onChangeRule={handleChangeRule}
        onDeleteRule={handleDeleteRule}
        onDuplicateRule={handleDuplicateRule}
        onGoBack={handleGoBack}
        onSaveRule={handleSaveRule}
      />
    );
  }

  return (
    <RulesTable
      rules={rules}
      onAddRule={handleAddRule}
      onClickRule={handleClickRule}
      onDeleteRules={handleDeleteRules}
    />
  );
};

RulesComponent.propTypes = {
  team: PropTypes.object.isRequired,
  setFlashMessage: PropTypes.func.isRequired,
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

export default injectIntl(withSetFlashMessage(RulesComponent));
