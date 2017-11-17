import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import MediaUtil from '../media/MediaUtil';

class EmbedCreate extends React.Component {
  render() {
    const { content, annotated, authorName } = this.props;
    let contentTemplate = null;
    let addedReport = false;
    let editedTitle = false;
    let createdNote = false;

    const reportType = MediaUtil.typeLabel(
      annotated,
      content,
      this.props.intl,
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
          { addedReport &&
            <FormattedMessage
              id="annotation.newReport"
              defaultMessage={'New {reportType} added by {author}'}
              values={{ reportType, author: authorName }}
            />
          }
          { editedTitle &&
            <FormattedMessage
              id="annotation.titleChanged"
              defaultMessage={'Title changed to "{title}" by {author}'}
              values={{ title: content.title, author: authorName }}
            />
          }
          { editedTitle && createdNote && <br /> }
          { createdNote &&
            <FormattedMessage
              id="annotation.embedNoteCreated"
              defaultMessage={'Description "{note}" was added by {author}'}
              values={{ note: content.description, author: authorName }}
            />
          }
        </span>
      );
    }

    return null;
  }
}

export default injectIntl(EmbedCreate);
