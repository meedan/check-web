import React from 'react';
import { FormattedMessage } from 'react-intl';
import Alert from '../cds/alerts-and-prompts/Alert';
import styles from './Task.module.css';

const EditTaskAlert = ({
  diff,
  showAlert,
  task,
}) => {
  if (!showAlert) return null;

  return (
    <Alert
      className={styles['edit-task-alert']}
      content={
        <>
          { diff.deleted.map(deletedOption => (
            <div key={deletedOption}>
              <FormattedMessage
                defaultMessage='• "{deletedOption}" will be permanently deleted from existing responses.'
                description="Body of warning when user tries to edit an annotation field that already has collected responses"
                id="tasks.deleteOptionWithAnswersBody"
                values={{ deletedOption }}
              />
            </div>
          ))}
          { Object.entries(diff.changed).map(([oldOption, newOption]) => (
            <div key={oldOption}>
              <FormattedMessage
                defaultMessage='• "{oldOption}" will be changed to "{newOption}" in existing responses.'
                description="Body of warning when user tries to edit an annotation field that already has collected responses"
                id="tasks.changeOptionWithAnswersBody"
                values={{ oldOption, newOption }}
              />
            </div>
          ))}
          { diff.added.length ? (
            <div>
              <FormattedMessage
                defaultMessage="{number, plural, one {• # new option will be added to this field.} other {• # new options will be added to this field.}}"
                description="Body of warning when user tries to edit an annotation field that already has collected responses"
                id="tasks.addOptionWithAnswersBody"
                values={{ number: diff.added.length }}
              />
            </div>
          ) : null }
        </>
      }
      icon
      title={
        <FormattedMessage
          defaultMessage="{number, plural, one {Editing field with # existing response} other {Editing field with # existing responses}}"
          description="Title of warning when user tries to edit an annotation field that already has collected responses"
          id="tasks.editFieldWithAnswersTitle"
          values={{ number: task.tasks_with_answers_count }}
        />
      }
      variant="warning"
    />
  );
};

export default EditTaskAlert;
