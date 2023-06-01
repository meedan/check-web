import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TextField from '../../cds/inputs/TextField';

const LimitedTextField = ({
  maxChars,
  value,
  setValue,
  onChange,
  ...textFieldProps
}) => {
  const [error, setError] = React.useState(false);

  const handleChange = (e) => {
    setValue(e.target.value);
    if (e.target.value.length > maxChars) {
      setError(true);
    } else {
      setError(false);
    }
  };

  return (
    <TextField
      required
      helpContent={<FormattedMessage
        id="limitedTextFieldWithCounter.counter"
        defaultMessage="{remaining, plural, one {# character left} other {# characters left}}"
        description="Label that displays how many characters more can be typed"
        values={{ remaining: maxChars - value.length }}
      />}
      onChange={onChange || handleChange}
      value={value}
      error={error}
      {...textFieldProps}
    />
  );
};

LimitedTextField.propTypes = {
  maxChars: PropTypes.number.isRequired,
};

export default LimitedTextField;
