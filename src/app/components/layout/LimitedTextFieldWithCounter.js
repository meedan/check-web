import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TextField from '@material-ui/core/TextField';

const LimitedTextFieldWithCounter = ({
  limit,
  label,
  onUpdate,
  rows,
  value,
  textFieldProps,
}) => {
  // Making sure component doesn't crash if value is null.
  // defaultProps only seem to step in when value is undefined.
  const [remaining, setRemaining] = React.useState(limit - (value?.length || 0));

  return (
    <TextField
      label={
        <React.Fragment>
          {label}
          {' '}
          <FormattedMessage
            id="limitedTextFieldWithCounter.counter"
            defaultMessage="{remaining, plural, one {(# character left)} other {(# characters left)}}"
            description="Label that displays how many characters more can be typed"
            values={{ remaining }}
          />
        </React.Fragment>
      }
      inputProps={{ maxLength: limit, style: { maxHeight: 266, overflow: 'auto' } }}
      onChange={(e) => { setRemaining(limit - e.target.value.trim().length); }}
      onBlur={(e) => { onUpdate(e.target.value.trim()); }}
      defaultValue={value}
      rows={rows}
      multiline
      rowsMax={Infinity}
      variant="outlined"
      fullWidth
      {...textFieldProps}
    />
  );
};

LimitedTextFieldWithCounter.defaultProps = {
  rows: 1,
  value: '',
  textFieldProps: {},
  label: null,
};

LimitedTextFieldWithCounter.propTypes = {
  limit: PropTypes.number.isRequired,
  onUpdate: PropTypes.func.isRequired,
  value: PropTypes.string,
  label: PropTypes.object,
  rows: PropTypes.number,
  textFieldProps: PropTypes.object,
};

export default LimitedTextFieldWithCounter;
