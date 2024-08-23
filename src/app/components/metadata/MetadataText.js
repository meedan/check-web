/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import TextArea from '../cds/inputs/TextArea';

const messages = defineMessages({
  placeholder: {
    id: 'metatdataText.placeholder',
    defaultMessage: 'Add annotation answer',
    description: 'Placeholder of the input field for annotation answer',
  },
  label: {
    id: 'metatdataText.answerTitle',
    defaultMessage: 'Answer',
    description: 'Input title for a metadata answer field',
  },
});

function MetadataText({
  AnnotatorInformation,
  CancelButton,
  DeleteButton,
  EditButton,
  FieldInformation,
  SaveButton,
  disabled,
  hasData,
  intl,
  isEditing,
  metadataValue,
  node,
  required,
  setMetadataValue,
}) {
  const mutationPayload = {
    annotation_type: 'task_response_free_text',
    set_fields: `{"response_free_text":"${metadataValue}"}`,
  };

  function handleChange(e) {
    setMetadataValue(e.target.value);
  }

  function cleanup() {
    setMetadataValue('');
  }

  function linkify(plainText) {
    // regexes modified from https://stackoverflow.com/a/3809435/4869657, adding word boundaries and greedy operator
    // this regex replacement uses capture groups. $1 is the entire captured url within the word boundary. $2 is the captured protocol, and $4 is the post-protocol portion of the url. By using the `//` "protocol-relative url" scheme, we end up redirecting cases of `example.com` to `https://example.com` since Check is served on an https url.
    const parsedText = plainText.replace(/\b((http:|https:)?(\/\/)?((www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)))\b/g, '<a href="$2//$4" target="_blank">$1</a>');
    return <span dangerouslySetInnerHTML={{ __html: parsedText }} />; // eslint-disable-line react/no-danger
  }

  return (
    <>
      <FieldInformation />
      {hasData && !isEditing ? (
        <>
          <div>
            {linkify(node.first_response_value)}
          </div>
          <EditButton />
          <DeleteButton onClick={cleanup} />
          <AnnotatorInformation />
        </>
      ) : (
        <>
          <TextArea
            disabled={disabled}
            id="metadata-input"
            label={intl.formatMessage(messages.label)}
            maxHeight="126px"
            placeholder={intl.formatMessage(messages.placeholder)}
            value={metadataValue}
            onChange={handleChange}
            onRemove={disabled ? null : cleanup}
          />
          <CancelButton />
          <SaveButton
            {...{ mutationPayload, required }}
            empty={metadataValue === ''}
          />
        </>
      )}
    </>
  );
}

MetadataText.defaultProps = {
  disabled: false,
};

MetadataText.propTypes = {
  node: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  EditButton: PropTypes.element.isRequired,
  DeleteButton: PropTypes.element.isRequired,
  CancelButton: PropTypes.element.isRequired,
  SaveButton: PropTypes.element.isRequired,
  AnnotatorInformation: PropTypes.element.isRequired,
  FieldInformation: PropTypes.element.isRequired,
  hasData: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool.isRequired,
  metadataValue: PropTypes.string.isRequired,
  setMetadataValue: PropTypes.func.isRequired,
};

export default injectIntl(MetadataText);
