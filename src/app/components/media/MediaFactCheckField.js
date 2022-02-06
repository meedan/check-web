import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';

const messages = defineMessages({
  placeholder: {
    id: 'mediaFactCheckField.noClaimDescription',
    defaultMessage: 'Add a claim to access the fact-check',
    description: 'Placeholder for fact-check field when there is no claim description filled.',
  },
});

const MediaFactCheckField = ({
  hasClaimDescription,
  hasPermission,
  multiline,
  label,
  name,
  value,
  disabled,
  rows,
  onBlur,
  intl,
}) => {
  const fieldProps = {};

  if (hasClaimDescription) {
    fieldProps.defaultValue = value || '';
  } else {
    fieldProps.defaultValue = intl.formatMessage(messages.placeholder);
  }

  if (multiline) {
    fieldProps.multiline = true;
    fieldProps.rows = rows;
    fieldProps.rowsMax = Infinity;
  }

  return (
    <Box my={2}>
      <TextField
        id={`media-fact-check__${name}`}
        className={`media-fact-check__${name}`}
        label={label}
        onBlur={(e) => { onBlur(e.target.value); }}
        variant="outlined"
        disabled={!hasPermission || disabled}
        key={`media-fact-check__${name}-${hasClaimDescription}`}
        inputProps={{ style: { maxHeight: 266, overflow: 'auto' } }}
        fullWidth
        {...fieldProps}
      />
    </Box>
  );
};

MediaFactCheckField.defaultProps = {
  multiline: false,
  disabled: false,
  rows: 3,
};

MediaFactCheckField.propTypes = {
  hasClaimDescription: PropTypes.bool.isRequired,
  hasPermission: PropTypes.bool.isRequired,
  multiline: PropTypes.bool,
  label: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  rows: PropTypes.number,
  onBlur: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(MediaFactCheckField);
