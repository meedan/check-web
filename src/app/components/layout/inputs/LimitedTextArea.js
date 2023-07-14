import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TextArea from '../../cds/inputs/TextArea';

const LimitedTextArea = ({
  maxChars,
  value,
  setValue,
  onChange,
  onBlur,
  helpContent,
  onErrorTooLong,
  ...textFieldProps
}) => {
  const [localError, setLocalError] = React.useState(false);
  const [localText, setLocalText] = React.useState(value);

  const inputRef = React.useRef();

  React.useEffect(() => {
    if ((localText.length || 0) > maxChars) {
      setLocalError(true);
      onErrorTooLong(true);
    } else if (localError) { // only trigger this when we *transition* to an error state - this way it only rerenders the parent component when an error triggers, rather than transitioning from error=false to error=false
      setLocalError(false);
      onErrorTooLong(false);
    }
  });

  const handleChange = (e) => {
    setLocalText(inputRef.current.value);
    if (onChange) {
      onChange(e);
    }
  };

  const handleBlur = (e) => {
    if (setValue) {
      setValue(inputRef.current?.value);
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <TextArea
      required
      ref={inputRef}
      value={localText}
      helpContent={(
        <>
          {helpContent && (<>{helpContent}<br /></>)}
          <FormattedMessage
            id="limitedTextAreaWithCounter.counter"
            defaultMessage="{remaining, plural, one {# character left} other {# characters left}}"
            description="Label that displays how many characters more can be typed"
            values={{ remaining: maxChars - (localText.length || 0) }}
          />
        </>
      )}
      onChange={handleChange}
      onBlur={handleBlur}
      {...textFieldProps}
      error={localError || textFieldProps.error}
    />
  );
};

LimitedTextArea.defaultProps = {
  value: '',
  helpContent: null,
  textFieldProps: {},
  onErrorTooLong: () => {},
};

LimitedTextArea.propTypes = {
  maxChars: PropTypes.number.isRequired,
  value: PropTypes.string,
  setValue: PropTypes.func.isRequired,
  helpContent: PropTypes.element,
  onErrorTooLong: PropTypes.func,
  textFieldProps: PropTypes.object,
};

export default LimitedTextArea;
