import React from 'react';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import RemoveableWrapper from './RemoveableWrapper';
import NumberIcon from '../../icons/NumberIcon';
import { checkBlue } from '../../styles/js/shared';

const messages = defineMessages({
  linkedItems: {
    id: 'numericRangeFilter.linkedItems',
    defaultMessage: 'Number of similar medias is between',
    description: 'Filter option that refers to number of similar medias',
  },
  suggestedItems: {
    id: 'numericRangeFilter.suggestedItems',
    defaultMessage: 'Number of suggested medias is between',
    description: 'Filter option that refers to number of suggested medias',
  },
  tiplineRequests: {
    id: 'numericRangeFilter.tiplineRequests',
    defaultMessage: 'Number of tipline requests is between',
    description: 'Filter option that refers to tipline requests',
  },
});

const useStyles = makeStyles(theme => ({
  root: {
    width: theme.spacing(15),
    '& fieldset': {
      fontSize: '14px',
    },
  },
  inputMarginDense: {
    padding: '4px 8px',
  },
  inputNotEmpty: {
    '& fieldset': {
      border: `2px solid ${checkBlue}`,
    },
  },
}));

const NumericRangeFilter = ({
  onChange,
  onRemove,
  readOnly,
  filterKey,
  value,
  intl,
}) => {
  const classes = useStyles();
  const defaultMinValue = (value && value.min) ? value.min : 0;
  const defaultMaxValue = (value && value.max) ? value.max : '';
  const [minNumber, setMinNumber] = React.useState(defaultMinValue);
  const [maxNumber, setMaxNumber] = React.useState(defaultMaxValue);
  const [showErrorMsg, setShowErrorMsg] = React.useState(false);

  const filterKeysMapping = { linked_items_count: 'linkedItems', suggestions_count: 'suggestedItems', demand: 'tiplineRequests' };

  const handleFieldChange = (key, keyValue) => {
    const range = { min: minNumber, max: maxNumber };
    if (key === 'min') {
      setMinNumber(keyValue);
      range.min = keyValue;
    } else if (key === 'max') {
      setMaxNumber(keyValue);
      range.max = keyValue;
    }
    if (range.max !== '' && parseInt(range.min, 10) > parseInt(range.max, 10)) {
      setShowErrorMsg(true);
    } else {
      setShowErrorMsg(false);
      onChange(filterKey, range);
    }
  };

  return (
    <div>
      <RemoveableWrapper icon={<NumberIcon />} readOnly={readOnly} onRemove={onRemove} boxProps={{ px: 0.5 }}>
        <Box display="flex" alignItems="center">
          <Box pr={1}>
            <Typography component="span" variant="body2">
              { intl.formatMessage(messages[filterKeysMapping[filterKey]]) }
            </Typography>
          </Box>
          <FormattedMessage id="numericRangeFilter.enterNumber" defaultMessage="enter number">
            { placeholder => (
              <TextField
                className={`${classes.root} ${minNumber === '' ? '' : classes.inputNotEmpty}`}
                InputProps={{ classes: { inputMarginDense: classes.inputMarginDense } }}
                variant="outlined"
                size="small"
                placeholder={placeholder}
                value={minNumber}
                onChange={(e) => { handleFieldChange('min', e.target.value); }}
                type="number"
                error={showErrorMsg}
              />
            )}
          </FormattedMessage>
          <Box px={1}>
            <Typography component="span" variant="body2">
              <FormattedMessage id="numericRangeFilter.between" defaultMessage="and" />
            </Typography>
          </Box>
          <FormattedMessage id="numericRangeFilter.enterNumber" defaultMessage="enter number">
            { placeholder => (
              <TextField
                className={`${classes.root} ${maxNumber === '' ? '' : classes.inputNotEmpty}`}
                InputProps={{ classes: { inputMarginDense: classes.inputMarginDense } }}
                variant="outlined"
                size="small"
                placeholder={placeholder}
                value={maxNumber}
                onChange={(e) => { handleFieldChange('max', e.target.value); }}
                type="number"
                error={showErrorMsg}
              />
            )}
          </FormattedMessage>
        </Box>
      </RemoveableWrapper>
      { showErrorMsg ?
        <Box alignItems="center" color="red" display="flex">
          <Box pr={1}><ErrorOutlineIcon /></Box>
          <Typography component="span" variant="body2">
            <FormattedMessage
              id="numericRangeFilter.errorMessage"
              defaultMessage="First number should be less than second number"
              description="Message when user set range number with min value greater than max value"
            />
          </Typography>
        </Box> : null
      }
    </div>
  );
};


NumericRangeFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default injectIntl(NumericRangeFilter);
