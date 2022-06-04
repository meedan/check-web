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
  const [remaining, setRemaining] = React.useState(limit - value.length);

  return (
    <TextField
      label={
        <React.Fragment>
          {label}
          {' '}
          <FormattedMessage
            id="limitedTextFieldWithCounter.counter"
            defaultMessage="{remaining, plural, one {(# character left)} other {(# characters left)}}"
            values={{ remaining }}
          />
        </React.Fragment>
      }
      inputProps={{ maxLength: limit, style: { maxHeight: 266, overflow: 'auto' } }}
      onChange={(e) => { setRemaining(limit - e.target.value.trim().length); }}
      onBlur={(e) => { onUpdate(e.target.value.trim()); }}
      defaultValue={value}
      rows={rows}
      multiline={rows > 1}
      rowsMax={rows > 1 ? Infinity : 1}
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
};

LimitedTextFieldWithCounter.propTypes = {
  limit: PropTypes.number.isRequired,
  label: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  rows: PropTypes.number,
  value: PropTypes.string,
  textFieldProps: PropTypes.object,
};

export default LimitedTextFieldWithCounter;
