import React from 'react';
import { FormattedMessage } from 'react-intl';
import ParsedText from '../ParsedText';

const EmbedUpdate = (props) => {
  const changes = JSON.parse(props.activity.object_changes_json);
  if (!changes.data && changes.value_json) {
    changes.data = [JSON.parse(changes.value_json[0]), JSON.parse(changes.value_json[1])];
  }
  if (changes.data) {
    const from = changes.data[0];
    const to = changes.data[1];

    let editedTitle = false;
    let removedTitle = false;

    let editedNote = false;
    let createdNote = false;
    let removedNote = false;

    if (to.title && from.title !== to.title) {
      editedTitle = true;
    }
    if (from.title && !to.title) {
      removedTitle = true;
    }
    if (to.description && from.description !== to.description) {
      editedNote = true;
    }
    if (!from.description && to.description) {
      editedNote = false;
      createdNote = true;
    }
    if (from.description && !to.description) {
      removedNote = true;
    }
    const author = props.authorName;
    if (editedTitle || removedTitle || editedNote || createdNote) {
      return (
        <span>
          <span className="annotation__update-embed" />
          {editedTitle ?
            <FormattedMessage
              id="annotation.embedLabelUpdated"
              defaultMessage="Item title edited by {author}: {title}"
              values={{
                title: to.title,
                author,
              }}
            />
            : null}
          {removedTitle ?
            <FormattedMessage
              id="annotation.embedLabelRemoved"
              defaultMessage="Item title removed by {author}: {title}"
              values={{
                title: from.title,
                author,
              }}
            />
            : null}
          {(editedTitle || removedTitle) && editedNote ? <br /> : null}
          {editedNote ?
            <FormattedMessage
              id="annotation.embedNoteUpdated"
              defaultMessage="Item description edited by {author}{description}"
              values={{
                author,
                description: <ParsedText test={to.description} block />,
              }}
            />
            : null}
          {(editedTitle || removedTitle) && createdNote ? <br /> : null}
          {createdNote ?
            <FormattedMessage
              id="annotation.embedNoteCreated"
              defaultMessage="Item description added by {author}{description}"
              values={{
                author,
                description: <ParsedText test={to.description} block />,
              }}
            />
            : null}
          {(editedTitle || removedTitle) && removedNote ? <br /> : null}
          {removedNote ?
            <FormattedMessage
              id="annotation.embedNoteRemoved"
              defaultMessage="Item description removed by {author}{description}"
              values={{
                author,
                description: <ParsedText test={to.description} block />,
              }}
            />
            : null}
        </span>
      );
    }

    return null;
  }

  return null;
};

export default EmbedUpdate;
