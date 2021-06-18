import React from 'react';
import { FormattedMessage } from 'react-intl';
import { withStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Slider from '@material-ui/core/Slider';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  textFieldRoot: {
    maxWidth: theme.spacing(10),
    marginRight: theme.spacing(2),
  },
  sliderRoot: {
    maxWidth: theme.spacing(30),
  },
});

const ThresholdControl = ({
  classes,
  onChange,
  type,
  value,
}) => (
  <Box mb={2} ml={7}>
    <Box mb={1}>
      <strong>
        { type === 'matching' ? (
          <FormattedMessage
            id="thresholdControl.matching"
            defaultMessage="Matching threshold"
            description="Label for similarity matching threshold control"
          />
        ) : (
          <FormattedMessage
            id="thresholdControl.suggestion"
            defaultMessage="Suggestion threshold"
            description="Label for similarity suggestion threshold control"
          />
        )}
      </strong>
    </Box>
    <div>
      { type === 'matching' ? (
        <FormattedMessage
          id="thresholdControl.matchingExplainer"
          defaultMessage="If the confidence score is above this ratio, items will be matched and reports automatically sent to users."
        />
      ) : (
        <FormattedMessage
          id="thresholdControl.suggestionExplainer"
          defaultMessage="If the confidence score is above this ratio, items will be suggested as similar."
        />
      )}
    </div>
    <Box display="flex" alignItems="center" mt={1}>
      <TextField
        classes={{ root: classes.textFieldRoot }}
        variant="outlined"
        size="small"
      />
      <Slider
        classes={{ root: classes.sliderRoot }}
        value={value}
        onChange={onChange}
      />
    </Box>
  </Box>
);

// TODO PropTypes

export default withStyles(styles)(ThresholdControl);
