import React from 'react';
import PropTypes from 'prop-types';
import RuleToolbar from './RuleToolbar';
import RuleBody from './RuleBody';

const Rule = (props) => {
  const { rule } = props;

  return (
    <React.Fragment>
      <RuleToolbar
        unsavedChanges={props.unsavedChanges}
        actionsDisabled={!rule.updated_at}
        onGoBack={props.onGoBack}
        onSaveRule={props.onSaveRule}
        onDuplicateRule={props.onDuplicateRule}
        onDeleteRule={props.onDeleteRule}
      />
      <RuleBody
        schema={props.schema}
        rule={rule}
        onChangeRule={props.onChangeRule}
      />
    </React.Fragment>
  );
};

Rule.propTypes = {
  rule: PropTypes.object.isRequired,
  unsavedChanges: PropTypes.bool.isRequired,
  schema: PropTypes.object.isRequired,
  onGoBack: PropTypes.func.isRequired,
  onDeleteRule: PropTypes.func.isRequired,
  onDuplicateRule: PropTypes.func.isRequired,
  onSaveRule: PropTypes.func.isRequired,
  onChangeRule: PropTypes.func.isRequired,
};

export default Rule;
