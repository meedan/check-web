import React from 'react';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ErrorOutlineIcon from '../../icons/error_outline.svg';
import RemoveableWrapper from './RemoveableWrapper';
import NumberIcon from '../../icons/numbers.svg';
import styles from './search.module.css';

const messages = defineMessages({
  linkedItems: {
    id: 'numericRangeFilter.linkedItems',
    defaultMessage: 'Number of media is between',
    description: 'Filter option that refers to number of media',
  },
  suggestedItems: {
    id: 'numericRangeFilter.suggestedItems',
    defaultMessage: 'Number of suggestions is between',
    description: 'Filter option that refers to number of suggestions',
  },
  tiplineRequests: {
    id: 'numericRangeFilter.tiplineRequests',
    defaultMessage: 'Number of requests is between',
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
      border: '2px solid var(--brandMain)',
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
    if (keyValue >= 0) {
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
    }
  };

  return (
    <div className={styles['filter-wrapper']}>
      <RemoveableWrapper icon={<NumberIcon />} readOnly={readOnly} onRemove={onRemove}>
        <div className={styles['filter-label']}>
          { intl.formatMessage(messages[filterKeysMapping[filterKey]]) }
        </div>
        <FormattedMessage id="numericRangeFilter.enterNumber" defaultMessage="enter number" description="Placeholder for text field about entering a number value">
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
        <ButtonMain
          disabled
          theme="text"
          size="small"
          variant="text"
          customStyle={{ color: 'var(--textPrimary' }}
          label={<FormattedMessage id="numericRangeFilter.between" defaultMessage="and" description="Logical operator AND statement" />}
        />
        <FormattedMessage id="numericRangeFilter.enterNumber" defaultMessage="enter number" description="Placeholder for text field about entering a number value">
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
      </RemoveableWrapper>
      { !showErrorMsg ?
        <div className={styles['filter-error']}>
          <ErrorOutlineIcon />
          BRIAN
          <FormattedMessage
            id="numericRangeFilter.errorMessage"
            defaultMessage="First number should be less than second number"
            description="Message when user set range number with min value greater than max value"
          />
        </div> : null
      }
    </div>
  );
};


NumericRangeFilter.propTypes = {
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default injectIntl(NumericRangeFilter);
