import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import TextArea from '../cds/inputs/TextArea';
import LimitedTextArea from '../layout/inputs/LimitedTextArea';
import inputStyles from '../../styles/css/inputs.module.css';

const messages = defineMessages({
  placeholder: {
    id: 'mediaFactCheckField.noClaimDescription',
    defaultMessage: 'Add a claim to access the fact-check',
    description: 'Placeholder for fact-check field when there is no claim description filled.',
  },
});

const MediaFactCheckField = ({
  limit,
  hasClaimDescription,
  hasPermission,
  label,
  name,
  value,
  disabled,
  rows,
  onBlur,
  intl,
  required,
}) => {
  let defaultValue = intl.formatMessage(messages.placeholder);

  if (hasClaimDescription) {
    defaultValue = value || undefined;
  }

  const textFieldProps = {
    required,
    rows,
    id: `media-fact-check__${name}`,
    className: `media-fact-check__${name}`,
    disabled: (!hasPermission || disabled),
    key: `media-fact-check__${name}-${hasClaimDescription ? '-with-claim' : '-no-claim'}`,
  };

  return (
    <div className={inputStyles['form-fieldset-field']}>
      { limit !== null ?
        <LimitedTextArea
          autoGrow
          maxChars={limit}
          label={label}
          placeholder={name}
          value={defaultValue}
          onUpdate={(newValue) => { onBlur(newValue); }}
          {...textFieldProps}
        /> :
        <TextArea
          autoGrow
          maxHeight="266px"
          placeholder={name}
          label={label}
          onBlur={(e) => { onBlur(e.target.value.trim()); }}
          defaultValue={value}
          {...textFieldProps}
        />
      }
    </div>
  );
};

MediaFactCheckField.defaultProps = {
  disabled: false,
  rows: 3,
  required: false,
  limit: null,
  value: '',
};

MediaFactCheckField.propTypes = {
  limit: PropTypes.number, // or null (no limit)
  hasClaimDescription: PropTypes.bool.isRequired,
  hasPermission: PropTypes.bool.isRequired,
  label: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  rows: PropTypes.number,
  onBlur: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  required: PropTypes.bool,
};

export default injectIntl(MediaFactCheckField);
