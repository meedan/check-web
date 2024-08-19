import React from 'react';
import { FormattedMessage } from 'react-intl';
import TextField from '../cds/inputs/TextField';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import styles from './search.module.css';

const AnnotationFilterNumber = ({
  onChange,
  onError,
  query,
  teamTask,
}) => {
  const getFieldValue = (field) => {
    const teamTaskValue = query.team_tasks.find(tt => tt.id.toString() === teamTask.node.dbid.toString());
    const { range } = teamTaskValue;
    const value = range ? range[field] : '';
    return value;
  };

  const [showErrorMsg, setShowErrorMsg] = React.useState(false);
  const [minNumber, setMinNumber] = React.useState(getFieldValue('min'));
  const [maxNumber, setMaxNumber] = React.useState(getFieldValue('max'));

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
      onError((
        <FormattedMessage
          defaultMessage="First number should be less than second number"
          description="Message when user set range number with min value greater than max value"
          id="customFiltersManager.errorMessage"
        />
      ));
    } else {
      setShowErrorMsg(false);
      onError(null);
      onChange(['NUMERIC_RANGE'], { range });
    }
  };

  return (
    <>
      <ButtonMain
        customStyle={{ color: 'var(--color-gray-15' }}
        disabled
        label={<FormattedMessage defaultMessage="between" description="Filter operator denoting user is filtering by numbers between two values" id="numericRangeFilter.between" />}
        size="small"
        theme="text"
        variant="text"
      />
      <FormattedMessage defaultMessage="enter number" description="Placeholder text for the number input in this filter" id="customFiltersManager.enterNumber">
        { placeholder => (
          <TextField
            className={`int-annotation-filter-number__textfield--number-min ${styles['filter-input-number']}`}
            error={showErrorMsg}
            placeholder={placeholder}
            type="number"
            value={minNumber}
            onChange={(e) => { handleFieldChange('min', e.target.value); }}
          />
        )}
      </FormattedMessage>
      <ButtonMain
        customStyle={{ color: 'var(--color-gray-15' }}
        disabled
        label={<FormattedMessage defaultMessage="and" description="Logical operator AND statement" id="numericRangeFilter.and" />}
        size="small"
        theme="text"
        variant="text"
      />
      <FormattedMessage defaultMessage="enter number" description="Placeholder text for the number input in this filter" id="customFiltersManager.enterNumber">
        { placeholder => (
          <TextField
            className={`int-annotation-filter-number__textfield--number-max ${styles['filter-input-number']}`}
            error={showErrorMsg}
            placeholder={placeholder}
            type="number"
            value={maxNumber}
            onChange={(e) => { handleFieldChange('max', e.target.value); }}
          />
        )}
      </FormattedMessage>
    </>
  );
};

export default AnnotationFilterNumber;
