import React from 'react';
import { FormattedMessage } from 'react-intl';
import Alert from '../cds/alerts-and-prompts/Alert';
import styles from './Task.module.css';

const EditTaskAlert = ({
  showAlert,
  diff,
  task,
}) => {
  if (!showAlert) return null;

  return (
    <Alert
      className={styles['edit-task-alert']}
      icon
      variant="warning"
      title={
        <FormattedMessage
          id="tasks.editFieldWithAnswersTitle"
          defaultMessage="{number, plural, one {Editing field with # existing response} other {Editing field with # existing responses}}"
          description="Title of warning when user tries to edit an annotation field that already has collected responses"
          values={{ number: task.tasks_with_answers_count }}
        />
      }
      content={
        <>
          { diff.deleted.map(deletedOption => (
            <div key={deletedOption}>
              <FormattedMessage
                id="tasks.deleteOptionWithAnswersBody"
                defaultMessage='• "{deletedOption}" will be permanently deleted from existing responses.'
                description="Body of warning when user tries to edit an annotation field that already has collected responses"
                values={{ deletedOption }}
              />
            </div>
          ))}
          { Object.entries(diff.changed).map(([oldOption, newOption]) => (
            <div key={oldOption}>
              <FormattedMessage
                id="tasks.changeOptionWithAnswersBody"
                defaultMessage='• "{oldOption}" will be changed to "{newOption}" in existing responses.'
                description="Body of warning when user tries to edit an annotation field that already has collected responses"
                values={{ oldOption, newOption }}
              />
            </div>
          ))}
          { diff.added.length ? (
            <div>
              <FormattedMessage
                id="tasks.addOptionWithAnswersBody"
                defaultMessage="{number, plural, one {• # new option will be added to this field.} other {• # new options will be added to this field.}}"
                description="Body of warning when user tries to edit an annotation field that already has collected responses"
                values={{ number: diff.added.length }}
              />
            </div>
          ) : null }
        </>
      }
    />
  );
};

export default EditTaskAlert;
