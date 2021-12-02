import React from 'react';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import RemoveableWrapper from './RemoveableWrapper';
import NumberIcon from '../../icons/NumberIcon';

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
  },
  inputMarginDense: {
    padding: theme.spacing(1),
  },
}));

const NumericRangeFilter = ({
  onChange,
  onRemove,
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
    console.log('range', range); // eslint-disable-line no-console
    if (range.max !== '' && range.min > range.max) {
      setShowErrorMsg(true);
    } else {
      setShowErrorMsg(false);
      onChange(filterKey, range);
    }
  };

  return (
    <div>
      <RemoveableWrapper icon={<NumberIcon />} onRemove={onRemove} boxProps={{ px: 0.5 }}>
        <Box >
          <Typography component="span" onClick={onRemove}>
            { intl.formatMessage(messages[filterKeysMapping[filterKey]]) }
          </Typography>
          <TextField
            classes={{ root: classes.root }}
            InputProps={{ classes: { inputMarginDense: classes.inputMarginDense } }}
            variant="outlined"
            size="small"
            label={<FormattedMessage id="numericRangeFilter.enterNumber" defaultMessage="enter number" />}
            value={minNumber}
            onChange={(e) => { handleFieldChange('min', e.target.value); }}
            type="number"
            error={showErrorMsg}
          />
          <Typography component="span">
            <FormattedMessage id="numericRangeFilter.between" defaultMessage="and" />
          </Typography>
          <TextField
            classes={{ root: classes.root }}
            InputProps={{ classes: { inputMarginDense: classes.inputMarginDense } }}
            variant="outlined"
            size="small"
            label={<FormattedMessage id="numericRangeFilter.enterNumber" defaultMessage="enter number" />}
            value={maxNumber}
            onChange={(e) => { handleFieldChange('max', e.target.value); }}
            type="number"
            error={showErrorMsg}
          />
        </Box>
        { showErrorMsg ?
          <Box>
            <Typography component="span">
              <FormattedMessage
                id="numericRangeFilter.errorMessage"
                defaultMessage="First number should be less than second number"
                description="Message when user set range number with min value greater than max value"
              />
            </Typography>
          </Box> : null
        }
      </RemoveableWrapper>
    </div>
  );
};


NumericRangeFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default injectIntl(NumericRangeFilter);
