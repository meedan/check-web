import React from 'react';
import { FormattedMessage } from 'react-intl';
import TextField from '../cds/inputs/TextField';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import styles from './search.module.css';

const AnnotationFilterNumber = ({
  teamTask,
  query,
  onChange,
  onError,
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
          id="customFiltersManager.errorMessage"
          defaultMessage="First number should be less than second number"
          description="Message when user set range number with min value greater than max value"
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
        disabled
        theme="text"
        size="small"
        variant="text"
        customStyle={{ color: 'var(--textPrimary' }}
        label={<FormattedMessage id="numericRangeFilter.between" defaultMessage="between" description="Filter operator denoting user is filtering by numbers between two values" />}
      />
      <FormattedMessage id="customFiltersManager.enterNumber" defaultMessage="enter number" description="Placeholder text for the number input in this filter">
        { placeholder => (
          <TextField
            className={`int-annotation-filter-number__textfield--number-min ${styles['filter-input-number']}`}
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
        label={<FormattedMessage id="numericRangeFilter.and" defaultMessage="and" description="Logical operator AND statement" />}
      />
      <FormattedMessage id="customFiltersManager.enterNumber" defaultMessage="enter number" description="Placeholder text for the number input in this filter">
        { placeholder => (
          <TextField
            className={`int-annotation-filter-number__textfield--number-max ${styles['filter-input-number']}`}
            placeholder={placeholder}
            value={maxNumber}
            onChange={(e) => { handleFieldChange('max', e.target.value); }}
            type="number"
            error={showErrorMsg}
          />
        )}
      </FormattedMessage>
    </>
  );
};

export default AnnotationFilterNumber;
