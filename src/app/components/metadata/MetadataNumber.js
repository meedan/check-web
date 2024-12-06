import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import TextField from '../cds/inputs/TextField';

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

function MetadataNumber({
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
    annotation_type: 'task_response_number',
    set_fields: `{"response_number":"${metadataValue}"}`,
  };

  function handleChange(e) {
    setMetadataValue(e.target.value);
  }

  function cleanup() {
    setMetadataValue('');
  }

  function isNumeric(value) {
    return !Number.isNaN(+value) && Number.isFinite(+value);
  }

  return (
    <>
      <FieldInformation />
      {hasData && !isEditing ? (
        <>
          <div>
            {node.first_response_value}
          </div>
          <EditButton />
          <DeleteButton onClick={cleanup} />
          <AnnotatorInformation />
        </>
      ) : (
        <>
          <TextField
            componentProps={{
              min: '0',
            }}
            disabled={disabled}
            id="metadata-input"
            label={intl.formatMessage(messages.label)}
            placeholder={intl.formatMessage(messages.placeholder)}
            type="number"
            value={metadataValue}
            onChange={handleChange}
            onRemove={disabled ? null : cleanup}
          />
          <CancelButton />
          <SaveButton
            {...{ mutationPayload, required }}
            disabled={!metadataValue || !isNumeric(metadataValue)}
            empty={metadataValue === ''}
          />
        </>
      )}
    </>
  );
}

MetadataNumber.defaultProps = {
  disabled: false,
};

MetadataNumber.propTypes = {
  AnnotatorInformation: PropTypes.element.isRequired,
  CancelButton: PropTypes.element.isRequired,
  DeleteButton: PropTypes.element.isRequired,
  EditButton: PropTypes.element.isRequired,
  FieldInformation: PropTypes.element.isRequired,
  SaveButton: PropTypes.element.isRequired,
  disabled: PropTypes.bool,
  hasData: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool.isRequired,
  metadataValue: PropTypes.string.isRequired,
  node: PropTypes.object.isRequired,
  setMetadataValue: PropTypes.func.isRequired,
};

export default injectIntl(MetadataNumber);
