import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Slider from '@material-ui/core/Slider';
import TextField from '@material-ui/core/TextField';
import { alertRed } from '../../../styles/js/shared';

const styles = theme => ({
  textFieldRoot: {
    maxWidth: theme.spacing(10),
    marginRight: theme.spacing(2),
  },
  sliderRoot: {
    maxWidth: theme.spacing(30),
  },
  error: {
    color: alertRed,
  },
});

const ThresholdControl = ({
  classes,
  onChange,
  type,
  value,
  disabled,
  label,
  error,
}) => (
  <Box mb={2} ml={7}>
    <Box mb={1}>
      <strong>
        {label}
      </strong>
    </Box>
    <div>
      { type === 'matching' ? (
        <FormattedMessage
          data-testid="threshold-control__matching-explainer-message"
          id="thresholdControl.matchingExplainer"
          defaultMessage="If the confidence score is above this ratio, items will be matched and reports automatically sent to users."
        />
      ) : (
        <FormattedMessage
          data-testid="threshold-control__suggestion-explainer-message"
          id="thresholdControl.suggestionExplainer"
          defaultMessage="If the confidence score is above this ratio, items will be suggested as similar."
        />
      )}
    </div>
    <Box display="flex" alignItems="center" mt={1}>
      <TextField
        disabled={disabled}
        value={value}
        classes={{ root: classes.textFieldRoot }}
        variant="outlined"
        size="small"
        type="number"
        onChange={e => onChange(e.target.value)}
      />
      <Slider
        disabled={disabled}
        classes={{ root: classes.sliderRoot }}
        value={value}
        onChange={(e, newValue) => onChange(newValue)}
      />
    </Box>
    <Box color={alertRed} my={1}>
      { error ?
        <FormattedMessage
          data-testid="threshold-control__error-message"
          id="thresholdControl.suggestionGreaterThanMatchingError"
          defaultMessage="The suggestion threshold cannot be higher than the matching one."
          description="Error message displayed when suggestion threshold is set higher than value of matching threshold"
        /> : null
      }
    </Box>
  </Box>
);

ThresholdControl.defaultProps = {
  disabled: false,
  error: false,
};

ThresholdControl.propTypes = {
  classes: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  // handleInputChange: PropTypes.func.isRequired,
  type: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  label: PropTypes.node.isRequired,
};

export default withStyles(styles)(ThresholdControl);
