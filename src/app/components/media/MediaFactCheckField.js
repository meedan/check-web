import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import LimitedTextFieldWithCounter from '../layout/LimitedTextFieldWithCounter';

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
    <Box my={2}>
      { limit !== null ?
        <LimitedTextFieldWithCounter
          label={label}
          limit={limit}
          value={defaultValue}
          onUpdate={(newValue) => { onBlur(newValue); }}
          textFieldProps={textFieldProps}
        /> :
        <TextField
          label={label}
          inputProps={{ style: { maxHeight: 266, overflow: 'auto' } }}
          onBlur={(e) => { onBlur(e.target.value.trim()); }}
          defaultValue={value}
          multiline
          rowsMax={Infinity}
          variant="outlined"
          fullWidth
          {...textFieldProps}
        />
      }
    </Box>
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
