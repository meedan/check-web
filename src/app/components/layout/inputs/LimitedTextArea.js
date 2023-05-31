import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TextArea from '../../cds/inputs/TextArea';

const LimitedTextArea = ({
  maxChars,
  value,
  setValue,
  onChange,
  helpContent,
  ...textFieldProps
}) => {
  const [localError, setLocalError] = React.useState(false);

  React.useEffect(() => {
    if ((value?.length || 0) > maxChars) {
      setLocalError(true);
    } else {
      setLocalError(false);
    }
  });

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <TextArea
      required
      helpContent={(
        <>
          {helpContent && (<>{helpContent}<br /></>)}
          <FormattedMessage
            id="limitedTextAreaWithCounter.counter"
            defaultMessage="{remaining, plural, one {# character left} other {# characters left}}"
            description="Label that displays how many characters more can be typed"
            values={{ remaining: maxChars - (value?.length || 0) }}
          />
        </>
      )}
      onChange={onChange || handleChange}
      value={value}
      {...textFieldProps}
      error={localError || textFieldProps.error}
    />
  );
};

LimitedTextArea.defaultProps = {
  value: '',
  helpContent: null,
  textFieldProps: {},
};

LimitedTextArea.propTypes = {
  maxChars: PropTypes.number.isRequired,
  value: PropTypes.string,
  setValue: PropTypes.func.isRequired,
  helpContent: PropTypes.element,
  textFieldProps: PropTypes.object,
};

export default LimitedTextArea;
