/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import ParsedText from '../ParsedText';

const EmbedCreate = (props) => {
  const { content, annotated, authorName } = props;
  let addedReport = false;
  let editedTitle = false;
  let createdNote = false;

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
            defaultMessage="Item added by {author}"
            values={{
              author: authorName,
            }}
          /> : null
        }
        {editedTitle ?
          <FormattedMessage
            id="annotation.titleChanged"
            defaultMessage="Item title edited by {author}: {title}"
            values={{
              title: content.title,
              author: authorName,
            }}
          /> : null
        }
        {editedTitle && createdNote ? <br /> : null}
        {createdNote ?
          <FormattedMessage
            id="annotation.embedNoteCreated"
            defaultMessage="Item description added by {author}{description}"
            values={{
              author: authorName,
              description: <ParsedText text={content.description} block />,
            }}
          /> : null
        }
      </span>
    );
  }

  return null;
};

export default injectIntl(EmbedCreate);
