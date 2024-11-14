import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Slider from '@material-ui/core/Slider';
import TextField from '../../cds/inputs/TextField';
import styles from './ThresholdControl.module.css';
import settingsStyles from '../Settings.module.css';

const ThresholdControl = ({
  disabled,
  error,
  label,
  onChange,
  type,
  value,
}) => (
  <div className={styles['threshold-control']}>
    <strong>
      {label}
    </strong>
    { type === 'matching' ? (
      <FormattedMessage
        data-testid="threshold-control__matching-explainer-message"
        defaultMessage="If the confidence score is above this ratio, items will be matched and reports automatically sent to users."
        description="Description of the confidence score automatically triggering a report being sent to the user"
        id="thresholdControl.matchingExplainer"
        tagName="p"
      />
    ) : (
      <FormattedMessage
        data-testid="threshold-control__suggestion-explainer-message"
        defaultMessage="If the confidence score is above this ratio, items will be suggested as similar."
        description="Description of the confidence score automatically suggesting an item to a system editor"
        id="thresholdControl.suggestionExplainer"
        tagName="p"
      />
    )}
    <div className={styles['threshold-control-inputs']}>
      <TextField
        className={settingsStyles['similarity-component-input']}
        componentProps={{
          min: '0',
        }}
        disabled={disabled}
        size="small"
        type="number"
        value={value}
        variant="outlined"
        onChange={e => onChange(e.target.value)}
      />
      <Slider
        disabled={disabled}
        value={value}
        onChange={(e, newValue) => onChange(newValue)}
      />
    </div>
    { error ?
      <div className={styles['threshold-control-error']}>
        <FormattedMessage
          data-testid="threshold-control__error-message"
          defaultMessage="The suggestion threshold cannot be higher than the matching one."
          description="Error message displayed when suggestion threshold is set higher than value of matching threshold"
          id="thresholdControl.suggestionGreaterThanMatchingError"
        />
      </div> : null
    }
  </div>
);

ThresholdControl.defaultProps = {
  disabled: false,
  error: false,
};

ThresholdControl.propTypes = {
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  // handleInputChange: PropTypes.func.isRequired,
  label: PropTypes.node.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ThresholdControl;
