/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import RuleToolbar from './RuleToolbar';
import RuleBody from './RuleBody';
import settingsStyles from '../Settings.module.css';

const Rule = (props) => {
  const { rule } = props;

  return (
    <React.Fragment>
      <div className={settingsStyles['setting-details-wrapper']}>
        <RuleToolbar
          actionsDisabled={!rule.updated_at}
          unsavedChanges={props.unsavedChanges}
          onDeleteRule={props.onDeleteRule}
          onDuplicateRule={props.onDuplicateRule}
          onGoBack={props.onGoBack}
          onSaveRule={props.onSaveRule}
        />
        <RuleBody
          rule={rule}
          schema={props.schema}
          onChangeRule={props.onChangeRule}
        />
      </div>
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
