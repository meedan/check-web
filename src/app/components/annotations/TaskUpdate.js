import React from 'react';
import { FormattedMessage } from 'react-intl';

// TODO Remove those global variables
let from = null;
let to = null;
let assignment = null;
let editedTitle = false;
let editedNote = false;
let createdNote = false;
let changedAssignment = false;
let removedAssignment = false;

function shouldLogChange(activity) {
  const changes = JSON.parse(activity.object_changes_json);

  if (changes.data) {
    ([from, to] = changes.data);

    if (from.label && to.label && from.label !== to.label) {
      editedTitle = true;
    }
    if (to.description && from.description !== to.description) {
      editedNote = true;
    }
    if (!from.description && to.description) {
      editedNote = false;
      createdNote = true;
    }
  }
  if (changes.assigned_to_id) {
    assignment = changes.assigned_to_id;
    if (assignment[1]) {
      changedAssignment = true;
    } else {
      removedAssignment = true;
    }
  }
  if (editedTitle || editedNote || createdNote || changedAssignment || removedAssignment) {
    return true;
  }
  return false;
}

class TaskUpdate extends React.Component {
  // TODO When removing global variables you can remove this eslint command
  // eslint-disable-next-line class-methods-use-this
  componentWillUpdate() {
    editedTitle = false;
    editedNote = false;
    createdNote = false;
    changedAssignment = false;
    removedAssignment = false;
  }

  render() {
    const { authorName: author, activity } = this.props;

    if (shouldLogChange(activity)) {
      let title = '';
      let assigneeFrom = null;
      let assigneeTo = null;
      if (changedAssignment || removedAssignment) {
        title = JSON.parse(activity.object_after).data.label;
        if (activity.meta) {
          const assignee = JSON.parse(activity.meta);
          assigneeFrom = assignee.assigned_from_name;
          assigneeTo = assignee.assigned_to_name;
        }
      }

      const contentTemplate = (
        <span>
          <span className="annotation__update-task" />
          {editedTitle ?
            <FormattedMessage
              id="annotation.taskLabelUpdated"
              defaultMessage='Task "{from}" edited to "{to}" by {author}'
              values={{ from: from.label, to: to.label, author }}
            />
            : null}
          {editedTitle && editedNote ? <br /> : null}
          {editedNote ?
            <FormattedMessage
              id="annotation.taskNoteUpdated"
              defaultMessage='Task "{title}" has note edited from "{from}" to "{to}" by {author}'
              values={{
                title: to.label, from: from.description, to: to.description, author,
              }}
            />
            : null}
          {editedTitle && createdNote ? <br /> : null}
          {createdNote ?
            <FormattedMessage
              id="annotation.taskNoteCreated"
              defaultMessage='Task "{title}" has new note "{note}" by {author}'
              values={{ title: to.label, note: to.description, author }}
            />
            : null}
          {changedAssignment ?
            <FormattedMessage
              id="annotation.assignmentChanged"
              defaultMessage='Task "{title}" assigned to "{assigneeTo}" by {author}'
              values={{ title, assigneeTo, author }}
            />
            : null}
          {removedAssignment ?
            <FormattedMessage
              id="annotation.assignmentRemoved"
              defaultMessage='Task "{title}" unassigned from "{assigneeFrom}" by {author}'
              values={{ title, assigneeFrom, author }}
            />
            : null}
        </span>
      );

      editedTitle = false;
      editedNote = false;
      createdNote = false;
      changedAssignment = false;
      removedAssignment = false;

      return contentTemplate;
    }
    return null;
  }
}

export { TaskUpdate as default, shouldLogChange };
