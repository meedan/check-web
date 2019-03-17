import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';

const Memebuster = (props) => {
  const { activity, authorName } = props;

  const content =
    activity.annotation.content ? JSON.parse(activity.annotation.content) : null;

  if (!content) {
    return null;
  }

  const operation = content.find(it => it.field_name === 'memebuster_operation');

  if (!operation) {
    return null;
  }

  const operation_log = {
    save: (
      <FormattedMessage
        id="annotation.memeSaved"
        defaultMessage="Meme saved by {author}"
        values={{
          author: authorName,
        }}
      />
    ),
    publish: (
      <FormattedMessage
        id="annotation.memePublished"
        defaultMessage="Meme published by {author}"
        values={{
          author: authorName,
        }}
      />
    ),
  };

  return (
    <span className="annotation__update-embed">
      {operation_log[operation.value]}
    </span>
  );
};

export default injectIntl(Memebuster);
