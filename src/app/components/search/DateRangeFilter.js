import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { DatePicker } from '@material-ui/pickers';
import cx from 'classnames/bind';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import Select from '../cds/inputs/Select';
import TextField from '../cds/inputs/TextField';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import DateRangeIcon from '../../icons/calendar_month.svg';
import CloseIcon from '../../icons/clear.svg';
import KeyboardArrowDownIcon from '../../icons/chevron_down.svg';
import RemoveableWrapper from './RemoveableWrapper';
import styles from './search.module.css';

const messages = defineMessages({
  created_at: {
    id: 'search.dateSubmittedHeading',
    defaultMessage: 'Request submitted',
    description: 'This is a header in a drop down selector, to filter a search by the submission date',
  },
  media_published_at: {
    id: 'search.dateLastSubmittedHeading',
    defaultMessage: 'Media published',
    description: 'This is a heading in a drop down selector, to filter a search by the last submitted date',
  },
  updated_at: {
    id: 'search.dateUpdatedHeading',
    defaultMessage: 'Item updated',
    description: 'This is a heading in a drop down selector, to filter a search by date updated',
  },
  report_published_at: {
    id: 'search.datePublishedHeading',
    defaultMessage: 'Report published',
    description: 'This is a heading in a drop down selector, to filter a search by a report published date',
  },
  request_created_at: {
    id: 'search.dateRequestHeading',
    defaultMessage: 'Request submitted',
    description: 'This is a heading in a drop down selector, to filter a search by request created dates',
  },
  relativeDays: {
    id: 'search.relativeDays',
    defaultMessage: 'days ago',
    description: 'This is a label in a drop down selector, and will appear a sentence format like "Report published less than 3 days ago"',
  },
  relativeWeeks: {
    id: 'search.relativeWeeks',
    defaultMessage: 'weeks ago',
    description: 'This is a label in a drop down selector, and will appear a sentence format like "Report published less than 3 weeks ago".',
  },
  relativeMonths: {
    id: 'search.relativeMonths',
    defaultMessage: 'months ago',
    description: 'This is a label in a drop down selector, and will appear a sentence format like "Report published less than 3 months ago".',
  },
  relativeYears: {
    id: 'search.relativeYears',
    defaultMessage: 'years ago',
    description: 'This is a label in a drop down selector, and will appear a sentence format like "Report published less than 3 years ago".',
  },
  startEnd: {
    id: 'search.dateStartEnd',
    defaultMessage: 'between',
    description: 'This is a label in a drop down selector, to filter a search by dates. The user selects a range of dates including a start and end date. In English this would be the first part of a phrase like "Report published between February 3, 2022 and February 9, 2022".',
  },
  lessThan: {
    id: 'search.dateLessThan',
    defaultMessage: 'less than',
    description: 'This is a label in a drop down selector, to filter a search by dates. The dates are relative to the current day and in English this would be the first part of a phrase like "Report published less than 10 months ago".',
  },
  moreThan: {
    id: 'search.dateMoreThan',
    defaultMessage: 'more than',
    description: 'This is a label in a drop down selector, to filter a search by dates. The dates are relative to the current day and in English this would be the first part of a phrase like "Report published more than 10 months ago".',
  },
});

function parseStartDateAsISOString(moment) {
  const date = moment.toDate();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
}

function parseEndDateAsISOString(moment) {
  const date = moment.toDate();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString();
}

function DateRangeSelectorStartEnd(props) {
  const {
    getEndDateStringOrNull,
    getStartDateStringOrNull,
    handleChangeEndDate,
    handleChangeStartDate,
    handleClearDate,
  } = props;

  return (
    <div className={styles['filter-removable-wrapper']}>
      <DatePicker
        onChange={handleChangeStartDate}
        maxDate={getEndDateStringOrNull() || undefined}
        okLabel={<FormattedMessage id="global.ok" defaultMessage="OK" description="Generic label for a button or link for a user to press when they wish to confirm an action" />}
        cancelLabel={<FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />}
        value={getStartDateStringOrNull()}
        style={{ margin: '0 16px' }}
        TextFieldComponent={({ params, onClick, value: valueText }) => (
          <>
            <ButtonMain
              className={cx(
                'int-date-filter__button--start-date',
                {
                  [styles['filter-date']]: valueText,
                })
              }
              size="small"
              variant="contained"
              theme={valueText ? 'brand' : 'text'}
              label={
                !valueText ?
                  <FormattedMessage id="search.anyDate" defaultMessage="any date" description="Date picker placeholder" />
                  :
                  valueText
              }
              onClick={onClick}
              iconRight={!valueText && <KeyboardArrowDownIcon />}
              {...params}
            />
            { valueText &&
              <Tooltip
                title={
                  <FormattedMessage id="search.removeStartDateCondition" defaultMessage="Remove start date" description="Tooltip to tell the user they can add remove the start date portion of this filter" />
                }
                arrow
              >
                <span className={styles['filter-date-remove']}>
                  <ButtonMain
                    className="int-date-filter__button--clear-start-date"
                    iconCenter={<CloseIcon />}
                    onClick={e => handleClearDate(e, 'start_time')}
                    theme="brand"
                    variant="contained"
                    size="small"
                  />
                </span>
              </Tooltip>
            }
          </>
        )}
      />
      <DatePicker
        inputVariant="outlined"
        onChange={handleChangeEndDate}
        minDate={getStartDateStringOrNull() || undefined}
        okLabel={<FormattedMessage id="global.ok" defaultMessage="OK" description="Generic label for a button or link for a user to press when they wish to confirm an action" />}
        cancelLabel={<FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />}
        value={getEndDateStringOrNull()}
        TextFieldComponent={({ params, onClick, value: valueText }) => (
          <>
            <ButtonMain
              disabled
              theme="text"
              size="small"
              variant="text"
              customStyle={{ color: 'var(--textPrimary' }}
              label={<FormattedMessage id="search.beforeDate" defaultMessage="and" description="String displayed between after and before date pickers" />}
            />
            <ButtonMain
              className={cx(
                'int-date-filter__button--end-date',
                {
                  [styles['filter-date']]: valueText,
                })
              }
              size="small"
              variant="contained"
              theme={valueText ? 'brand' : 'text'}
              iconRight={!valueText && <KeyboardArrowDownIcon />}
              label={
                !valueText ?
                  <FormattedMessage id="search.anyDate" defaultMessage="any date" description="Date picker placeholder" />
                  :
                  valueText
              }
              onClick={onClick}
              {...params}
            />
            { valueText &&
              <Tooltip
                title={
                  <FormattedMessage id="search.removeEndDateCondition" defaultMessage="Remove end date" description="Tooltip to tell the user they can add remove the end date portion of this filter" />
                }
                arrow
              >
                <span className={styles['filter-date-remove']}>
                  <ButtonMain
                    className="int-date-filter__button--clear-end-date"
                    iconCenter={<CloseIcon />}
                    onClick={e => handleClearDate(e, 'end_time')}
                    theme="brand"
                    variant="contained"
                    size="small"
                  />
                </span>
              </Tooltip>
            }
          </>
        )}
      />
    </div>
  );
}

function DateRangeSelectorRelative(props) {
  const {
    handleChangeRelativeQuantity,
    handleChangeRelativeRange,
    intl,
    relativeQuantity,
    relativeRange,
  } = props;

  return (
    <>
      <FormattedMessage id="numericRangeFilter.enterNumber" defaultMessage="enter number" description="Placeholder text to tell the user to enter a number">
        { placeholder => (
          <TextField
            className={styles['filter-input-number']}
            variant="contained"
            placeholder={placeholder}
            onChange={handleChangeRelativeQuantity}
            value={relativeQuantity}
            type="number"
          />
        )}
      </FormattedMessage>
      <Select
        className={styles['filter-select']}
        onChange={handleChangeRelativeRange}
        value={relativeRange}
      >
        <option value="d"> { intl.formatMessage(messages.relativeDays) } </option>
        <option value="w"> { intl.formatMessage(messages.relativeWeeks) } </option>
        <option value="m"> { intl.formatMessage(messages.relativeMonths) } </option>
        <option value="y"> { intl.formatMessage(messages.relativeYears) } </option>
      </Select>
    </>
  );
}

const DateRangeFilter = ({
  classes,
  hide,
  value,
  optionsToHide,
  onChange,
  onRemove,
  intl,
}) => {
  const getValueType = () => {
    if (value && value.updated_at) return 'updated_at';
    if (value && value.media_published_at) return 'media_published_at';
    if (value && value.report_published_at) return 'report_published_at';
    if (value && value.request_created_at) return 'request_created_at';
    return 'created_at';
  };
  const rangeTypes = {
    startEnd: 'startEnd',
    less_than: 'less_than',
    more_than: 'more_than',
  };
  const getInitialRangeType = () => {
    if (value && value[getValueType()]?.condition) return rangeTypes[value[getValueType()]?.condition];
    if (value && value[getValueType()]?.start_time) return rangeTypes.startEnd;
    return rangeTypes.startEnd;
  };
  const [rangeType, setRangeType] = React.useState(getInitialRangeType());
  const relativeRanges = {
    days: 'd',
    weeks: 'w',
    months: 'm',
    years: 'y',
  };
  const [relativeRange, setRelativeRange] = React.useState((value && value[getValueType()]?.period_type) || relativeRanges.days);
  const [relativeQuantity, setRelativeQuantity] = React.useState((value && value[getValueType()]?.period) || '0');

  const getDateStringOrNull = field => (value && value[getValueType()][field]) || null;

  const getStartDateStringOrNull = () => getDateStringOrNull('start_time');

  const getEndDateStringOrNull = () => getDateStringOrNull('end_time');

  const buildValue = (valueType, startTimeOrNull, endTimeOrNull) => {
    const range = {};
    if (startTimeOrNull) {
      range.start_time = startTimeOrNull;
    }
    if (endTimeOrNull) {
      range.end_time = endTimeOrNull;
    }
    return { [valueType]: range };
  };

  const buildValueRelative = (valueType, relativeCondition, relativeQuantityValue, relativeRangeValue) => ({
    [valueType]: {
      condition: relativeCondition,
      period: +relativeQuantityValue,
      period_type: relativeRangeValue,
    },
  });

  const handleChangeStartDate = (moment) => {
    onChange(buildValue(
      getValueType(),
      parseStartDateAsISOString(moment),
      getEndDateStringOrNull(),
    ));
  };

  const handleChangeEndDate = (moment) => {
    onChange(buildValue(
      getValueType(),
      getStartDateStringOrNull(),
      parseEndDateAsISOString(moment),
    ));
  };

  const handleChangeType = (e) => {
    const valueType = e.target.value;
    if (rangeType === rangeTypes.startEnd) {
      onChange(buildValue(
        valueType,
        getStartDateStringOrNull(),
        getEndDateStringOrNull(),
      ));
    } else if (['less_than', 'more_than'].includes(rangeType)) {
      onChange(buildValueRelative(
        valueType,
        rangeType,
        relativeQuantity,
        relativeRange,
      ));
    }
    return null;
  };

  const handleChangeRangeType = (e) => {
    const valueRangeType = e.target.value;
    setRangeType(valueRangeType);
    if (valueRangeType === rangeTypes.startEnd) {
      onChange(buildValue(
        getValueType(),
        getStartDateStringOrNull(),
        getEndDateStringOrNull(),
      ));
    } else if (['less_than', 'more_than'].includes(valueRangeType)) {
      onChange(buildValueRelative(
        getValueType(),
        valueRangeType,
        relativeQuantity,
        relativeRange,
      ));
    }
  };

  const handleChangeRelativeRange = (e) => {
    const valueRelativeRange = e.target.value;
    setRelativeRange(valueRelativeRange);
    onChange(buildValueRelative(
      getValueType(),
      rangeType,
      relativeQuantity,
      valueRelativeRange,
    ));
  };

  const handleChangeRelativeQuantity = (e) => {
    if (e.target.value >= 0) {
      const valueRelativeQuantity = e.target.value;
      setRelativeQuantity(valueRelativeQuantity);
      onChange(buildValueRelative(
        getValueType(),
        rangeType,
        valueRelativeQuantity,
        relativeRange,
      ));
    }
  };

  const handleClearDate = (event, field) => {
    event.stopPropagation();
    if (field === 'start_time') {
      onChange(buildValue(
        getValueType(),
        null,
        getEndDateStringOrNull(),
      ));
    } else {
      onChange(buildValue(
        getValueType(),
        getStartDateStringOrNull(),
        null,
      ));
    }
  };

  if (hide) {
    return null;
  }

  return (
    <div className={styles['filter-wrapper']}>
      <div className={styles['filter-multidate-wrapper']}>
        <RemoveableWrapper icon={<DateRangeIcon />} onRemove={onRemove} />
        <Select
          className={styles['filter-select']}
          onChange={handleChangeType}
          value={getValueType()}
        >
          { ['created_at', 'media_published_at', 'updated_at', 'report_published_at', 'request_created_at'].filter(option => !optionsToHide.includes(option)).map(option => (
            <option key={option} value={option}>{ intl.formatMessage(messages[option]) }</option>
          ))}
        </Select>
        <Select
          className={styles['filter-select']}
          onChange={handleChangeRangeType}
          value={rangeType}
        >
          <option value="startEnd">{ intl.formatMessage(messages.startEnd) }</option>
          <option value="less_than">{ intl.formatMessage(messages.lessThan) }</option>
          <option value="more_than">{ intl.formatMessage(messages.moreThan) }</option>
        </Select>
        { rangeType === rangeTypes.startEnd ? (
          <DateRangeSelectorStartEnd {...{
            classes,
            getEndDateStringOrNull,
            getStartDateStringOrNull,
            handleChangeEndDate,
            handleChangeStartDate,
            handleClearDate,
          }}
          />
        ) : (
          <DateRangeSelectorRelative {...{
            classes,
            handleChangeRelativeQuantity,
            handleChangeRelativeRange,
            intl,
            onRemove,
            relativeQuantity,
            relativeRange,
          }}
          />
        )}
      </div>
    </div>
  );
};

DateRangeFilter.defaultProps = {
  hide: false,
  value: null,
  optionsToHide: [],
};

DateRangeFilter.propTypes = {
  classes: PropTypes.object.isRequired,
  hide: PropTypes.bool,
  optionsToHide: PropTypes.arrayOf(PropTypes.string),
  value: PropTypes.oneOfType([
    PropTypes.shape({
      created_at: PropTypes.oneOfType([
        PropTypes.shape({
          start_time: PropTypes.string,
          end_time: PropTypes.string,
        }),
        PropTypes.shape({
          condition: PropTypes.string,
          period: PropTypes.number,
          period_type: PropTypes.string,
        }),
      ]),
    }),
    PropTypes.shape({
      media_published_at: PropTypes.oneOfType([
        PropTypes.shape({
          start_time: PropTypes.string,
          end_time: PropTypes.string,
        }),
        PropTypes.shape({
          condition: PropTypes.string,
          period: PropTypes.number,
          period_type: PropTypes.string,
        }),
      ]),
    }),
    PropTypes.shape({
      updated_at: PropTypes.oneOfType([
        PropTypes.shape({
          start_time: PropTypes.string,
          end_time: PropTypes.string,
        }),
        PropTypes.shape({
          condition: PropTypes.string,
          period: PropTypes.number,
          period_type: PropTypes.string,
        }),
      ]),
    }),
    PropTypes.shape({
      report_published_at: PropTypes.oneOfType([
        PropTypes.shape({
          start_time: PropTypes.string,
          end_time: PropTypes.string,
        }),
        PropTypes.shape({
          condition: PropTypes.string,
          period: PropTypes.number,
          period_type: PropTypes.string,
        }),
      ]),
    }),
    PropTypes.shape({
      request_created_at: PropTypes.oneOfType([
        PropTypes.shape({
          start_time: PropTypes.string,
          end_time: PropTypes.string,
        }),
        PropTypes.shape({
          condition: PropTypes.string,
          period: PropTypes.number,
          period_type: PropTypes.string,
        }),
      ]),
    }),
  ]),
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(DateRangeFilter);
