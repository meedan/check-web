import React from 'react';
import { FormattedMessage } from 'react-intl';

let from = null;
let to = null;
let editedTitle = false;
let editedNote = false;
let createdNote = false;

function shouldLogChange(activity) {
  const changes = JSON.parse(activity.object_changes_json);
  if (changes.data) {
    from = changes.data[0];
    to = changes.data[1];

    if (from.label && to.label && from.label != to.label) {
      editedTitle = true;
    }
    if (to.description && from.description != to.description) {
      editedNote = true;
    }
    if (!from.description && to.description) {
      editedNote = false;
      createdNote = true;
    }

    if (editedTitle || editedNote || createdNote) {
      return true;
    }
  }
}

class TaskUpdate extends React.Component {
  componentWillUpdate(nextProps, nextState) {
    editedTitle = false;
    editedNote = false;
    createdNote = false;
  }

  render() {
    const author = this.props.authorName;

    if (shouldLogChange(this.props.activity)) {
      const contentTemplate = (
        <span>
          <span className="annotation__update-task" />
          {editedTitle
            ? <FormattedMessage
            id="annotation.taskLabelUpdated"
            defaultMessage={'Task "{from}" edited to "{to}" by {author}'}
            values={{ from: from.label, to: to.label, author }}
            />
          : null}
          { editedTitle && editedNote && <br />}
          { editedNote
            ? <FormattedMessage
            id="annotation.taskNoteUpdated"
            defaultMessage={
              'Task "{title}" has note edited from "{from}" to "{to}" by {author}'
            }
            values={{ title: to.label, from: from.description, to: to.description, author }}
            />
          : null}
          { editedTitle && createdNote && <br />}
          { createdNote
            ? <FormattedMessage
            id="annotation.taskNoteCreated"
            defaultMessage={'Task "{title}" has new note "{note}" by {author}'}
            values={{ title: to.label, note: to.description, author }}
            />
          : null}
        </span>
      );

      editedTitle = false;
      editedNote = false;
      createdNote = false;

      return contentTemplate;
    }
    return null;
  }
}

export default TaskUpdate;
export { shouldLogChange };
