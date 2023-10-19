import React from 'react';
import PropTypes from 'prop-types';
import TextArea from '../cds/inputs/TextArea';
import LimitedTextArea from '../layout/inputs/LimitedTextArea';
import inputStyles from '../../styles/css/inputs.module.css';

const MediaFactCheckField = ({
  helpContent,
  error,
  limit,
  hasClaimDescription,
  hasPermission,
  label,
  name,
  value,
  disabled,
  rows,
  onBlur,
  required,
  placeholder,
}) => {
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
          rows={rows}
          helpContent={helpContent}
          error={error}
          autoGrow
          maxChars={limit}
          label={label}
          placeholder={placeholder}
          defaultValue={value}
          onUpdate={(newValue) => { onBlur(newValue); }}
          {...textFieldProps}
        /> :
        <TextArea
          rows={rows}
          helpContent={helpContent}
          error={error}
          autoGrow
          maxHeight="266px"
          placeholder={placeholder}
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
  helpContent: null,
  error: false,
  disabled: false,
  rows: '3',
  required: false,
  limit: null,
  value: '',
  placeholder: null,
};

MediaFactCheckField.propTypes = {
  helpContent: PropTypes.element,
  error: PropTypes.bool,
  limit: PropTypes.number, // or null (no limit)
  hasClaimDescription: PropTypes.bool.isRequired,
  hasPermission: PropTypes.bool.isRequired,
  label: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  rows: PropTypes.string,
  onBlur: PropTypes.func.isRequired,
  required: PropTypes.bool,
  placeholder: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
};

export default MediaFactCheckField;
