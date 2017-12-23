import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import MediaUtil from '../media/MediaUtil';

const EmbedCreate = (props) => {
  const { content, annotated, authorName } = props;
  let addedReport = false;
  let editedTitle = false;
  let createdNote = false;

  const reportType = MediaUtil.typeLabel(
    annotated,
    content,
    props.intl,
  ).toLowerCase();

  if (content.title) {
    if (annotated.quote && annotated.quote === content.title) {
      addedReport = true;
    } else {
      editedTitle = true;
    }
  }

  if (content.description) {
    createdNote = true;
  }

  if (addedReport || editedTitle || createdNote) {
    return (
      <span className="annotation__update-embed">
        {addedReport ?
          <FormattedMessage
            id="annotation.newReport"
            defaultMessage="New {reportType} added by {author}"
            values={{ reportType, author: authorName }}
          /> : null
        }
        {editedTitle ?
          <FormattedMessage
            id="annotation.titleChanged"
            defaultMessage='Title changed to "{title}" by {author}'
            values={{ title: content.title, author: authorName }}
          /> : null
        }
        {editedTitle && createdNote ? <br /> : null}
        {createdNote ?
          <FormattedMessage
            id="annotation.embedNoteCreated"
            defaultMessage='Description "{note}" was added by {author}'
            values={{ note: content.description, author: authorName }}
          /> : null
        }
      </span>
    );
  }

  return null;
};

export default injectIntl(EmbedCreate);
