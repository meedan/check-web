/* eslint-disable react/sort-prop-types */
// DESIGNS: https://www.figma.com/file/bQWUXJItRRX8xO3uQ9FWdg/Multimedia-Newsletter-%2B-Report?type=design&node-id=656-50446&mode=design&t=PjtorENpol0lp5QG-4
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TextArea from '../../cds/inputs/TextArea';
import styles from '../../../styles/css/inputs.module.css';

const LimitedTextArea = ({
  helpContent,
  maxChars,
  onBlur,
  onChange,
  onErrorTooLong,
  required,
  setValue,
  value,
  ...textFieldProps
}) => {
  const [localError, setLocalError] = React.useState(false);
  const [localText, setLocalText] = React.useState(value);

  const inputRef = React.useRef();

  React.useEffect(() => {
    if ((localText?.length || 0) > maxChars) {
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
      helpContent={(
        <>
          {helpContent}
          <div className={styles['help-counter']}>
            <FormattedMessage
              defaultMessage="{remaining, plural, one {# character left} other {# characters left}}"
              description="Label that displays how many characters more can be typed"
              id="limitedTextAreaWithCounter.counter"
              values={{ remaining: maxChars - (localText?.length || 0) }}
            />
          </div>
        </>
      )}
      ref={inputRef}
      required={required}
      value={localText}
      onBlur={handleBlur}
      onChange={handleChange}
      {...textFieldProps}
      error={localError || textFieldProps.error}
    />
  );
};

LimitedTextArea.defaultProps = {
  required: true,
  value: '',
  setValue: null,
  helpContent: null,
  onErrorTooLong: () => {},
};

LimitedTextArea.propTypes = {
  maxChars: PropTypes.number.isRequired,
  value: PropTypes.string,
  setValue: PropTypes.func,
  helpContent: PropTypes.element,
  onErrorTooLong: PropTypes.func,
  required: PropTypes.bool,
};

export default LimitedTextArea;
