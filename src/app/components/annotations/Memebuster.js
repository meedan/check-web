import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';

const Memebuster = (props) => {
  const { object, authorName } = props;

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
      {operation_log[object.value]}
    </span>
  );
};

export default injectIntl(Memebuster);
