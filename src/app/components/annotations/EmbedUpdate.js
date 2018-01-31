import React from 'react';
import { FormattedMessage } from 'react-intl';

const EmbedUpdate = (props) => {
  const changes = JSON.parse(props.activity.object_changes_json);
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
              defaultMessage='Title changed to "{title}" by {author}'
              values={{ title: to.title, author }}
            />
            : null}
          {removedTitle ?
            <FormattedMessage
              id="annotation.embedLabelRemoved"
              defaultMessage='Title "{title}" removed by {author}'
              values={{ title: from.title, author }}
            />
            : null}
          {(editedTitle || removedTitle) && editedNote ? <br /> : null}
          {editedNote ?
            <FormattedMessage
              id="annotation.embedNoteUpdated"
              defaultMessage='Description edited from "{from}" to "{to}" by {author}'
              values={{ from: from.description, to: to.description, author }}
            />
            : null}
          {(editedTitle || removedTitle) && createdNote ? <br /> : null}
          {createdNote ?
            <FormattedMessage
              id="annotation.embedNoteCreated"
              defaultMessage='Description "{note}" was added by {author}'
              values={{ note: to.description, author }}
            />
            : null}
          {(editedTitle || removedTitle) && removedNote ? <br /> : null}
          {removedNote ?
            <FormattedMessage
              id="annotation.embedNoteRemoved"
              defaultMessage='Description "{note}" was removed by {author}'
              values={{ note: from.description, author }}
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
