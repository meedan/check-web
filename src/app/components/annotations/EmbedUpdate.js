import React from 'react';
import { FormattedMessage } from 'react-intl';

class EmbedUpdate extends React.Component {
  render() {
    const changes = JSON.parse(this.props.activity.object_changes_json);
    if (changes.data) {
      const from = changes.data[0];
      const to = changes.data[1];
      let editedTitle = false;
      let editedNote = false;
      let createdNote = false;
      if (from.title && to.title && from.title != to.title) {
        editedTitle = true;
      }
      if (to.description && from.description != to.description) {
        editedNote = true;
      }
      if (!from.description && to.description) {
        editedNote = false;
        createdNote = true;
      }
      const author = this.props.authorName;
      if (editedTitle || editedNote || createdNote) {
        return (
          <span>
            <span className="annotation__update-embed" />
            {editedTitle
                ? <FormattedMessage
                  id="annotation.embedLabelUpdated"
                  defaultMessage={'Title changed to "{title}" by {author}'}
                  values={{ title: to.title, author }}
                />
                : null}
            {editedNote
                ? <FormattedMessage
                  id="annotation.embedNoteUpdated"
                  defaultMessage={
                      'Description edited from "{from}" to "{to}" by {author}'
                    }
                  values={{ from: from.description, to: to.description, author }}
                />
                : null}
            {createdNote
                ? <FormattedMessage
                  id="annotation.embedNoteCreated"
                  defaultMessage={'Description "{note}" was added by {author}'}
                  values={{ label: to.label, note: to.description, author }}
                />
                : null}
          </span>
          );
      }

      return null;
    }
  }
}

export default EmbedUpdate;
