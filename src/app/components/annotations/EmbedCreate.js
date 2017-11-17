import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import MediaUtil from '../media/MediaUtil';

class EmbedCreate extends React.Component {
  render() {
    let contentTemplate = null;
    const { content, annotated, authorName } = this.props;

    if (content.title) {
      if (annotated.quote && annotated.quote === content.title) {
        const reportType = MediaUtil.typeLabel(
            annotated,
            content,
            this.props.intl,
          ).toLowerCase();
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.newReport"
              defaultMessage={'New {reportType} added by {author}'}
              values={{ reportType, author: authorName }}
            />
          </span>
          );
      } else {
        contentTemplate = (
          <span>
            <FormattedMessage
              id="annotation.titleChanged"
              defaultMessage={'Title changed to "{title}" by {author}'}
              values={{ title: <span>{content.title}</span>, author: authorName }}
            />
          </span>
          );
      }
    }

    if (content.description) {
      contentTemplate = (
        <span>
          <FormattedMessage
            id="annotation.embedNoteCreated"
            defaultMessage={'Description "{note}" was added by {author}'}
            values={{ note: <span>{content.description}</span>, author: authorName }}
          />
        </span>
      );
    }

    return contentTemplate;
  }
}

export default injectIntl(EmbedCreate);
