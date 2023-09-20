import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { DatePicker } from '@material-ui/pickers';
import FormControl from '@material-ui/core/FormControl';
import InputBase from '@material-ui/core/InputBase';
import FormLabel from '@material-ui/core/FormLabel';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import { withStyles } from '@material-ui/core/styles';
import DateRangeIcon from '../../icons/calendar_month.svg';
import CloseIcon from '../../icons/clear.svg';
import RemoveableWrapper from './RemoveableWrapper';
import { FlexRow, units } from '../../styles/js/shared';

const StyledCloseIcon = withStyles({
  root: {
    fontSize: '24px',
    cursor: 'pointer',
    padding: '4px',
  },
})(CloseIcon);

const StyledInputBaseDate = withStyles(theme => ({
  root: {
    backgroundColor: 'var(--grayDisabledBackground)',
    padding: `0 ${theme.spacing(0.5)}px`,
    height: theme.spacing(4.5),
    fontSize: 14,
    width: 150,
  },
  input: {
    color: 'var(--otherWhite)',
    padding: '4px 0 4px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
}))(InputBase);

const StyledInputBaseDropdown = withStyles(theme => ({
  root: {
    backgroundColor: 'var(--grayDisabledBackground)',
    padding: `0 ${theme.spacing(0.5)}px`,
    height: theme.spacing(4.5),
    fontSize: 14,
    borderRadius: '4px',
    '& .MuiSelect-icon': {
      color: 'var(--otherWhite)',
    },
  },
  input: {
    backgroundColor: 'var(--brandMain)',
    color: 'var(--otherWhite)',
    paddingLeft: theme.spacing(1),
    '&:focus': {
      backgroundColor: 'var(--brandMain)',
      borderRadius: 4,
    },
    padding: '4px 0 4px',
  },
}))(InputBase);

const Styles = {
  selectFormControl: {
    flexDirection: 'row',
    flexShrink: 0,
    alignItems: 'center',
    padding: '0 4px 0 0',
  },
  dateRangeFilterSelected: {
    backgroundColor: 'var(--brandMain)',
    color: 'var(--otherWhite)',
    height: 'auto',
    borderRadius: 4,
    paddingLeft: '8px',
    lineHeight: '10px',
  },
  inputMarginDense: {
    padding: '4px 8px',
  },
  numericSelector: {
    maxWidth: '100px',
  },
  andText: {
    paddingLeft: '8px',
    paddingRight: '8px',
  },
  wrapper: {
    backgroundColor: 'var(--grayDisabledBackground)',
    borderRadius: '4px',
  },
};

function parseStartDateAsISOString(moment) {
  const date = moment.toDate();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
}

function parseEndDateAsISOString(moment) {
  const date = moment.toDate();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString();
}

// linear equation that gives us a good width relative to the text length with fairly stable right-padding
function setInputWidth(textLength) {
  return ((textLength || 7) * 12.5) - ((5 * Math.max(7, textLength)) - 35);
}

function DateRangeSelectorStartEnd(props) {
  const {
    classes,
    getEndDateStringOrNull,
    getStartDateStringOrNull,
    handleChangeEndDate,
    handleChangeStartDate,
    handleClearDate,
  } = props;

  return (
    <>
      <DatePicker
        onChange={handleChangeStartDate}
        maxDate={getEndDateStringOrNull() || undefined}
        okLabel={<FormattedMessage id="global.ok" defaultMessage="OK" description="Generic label for a button or link for a user to press when they wish to confirm an action" />}
        cancelLabel={<FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />}
        value={getStartDateStringOrNull()}
        style={{ margin: `0 ${units(2)}` }}
        TextFieldComponent={({ onClick, value: valueText }) => (
          <div>
            <FormattedMessage id="search.anyDate" defaultMessage="any date" description="Date picker placeholder">
              { text => (
                <StyledInputBaseDate
                  className={valueText ? ['date-range__start-date', classes.dateRangeFilterSelected].join(' ') : 'date-range__start-date'}
                  type="text"
                  style={{ width: `${setInputWidth(valueText.length)}px` }}
                  placeholder={text}
                  onClick={onClick}
                  value={valueText}
                  endAdornment={valueText ? <StyledCloseIcon onClick={e => handleClearDate(e, 'start_time')} /> : null}
                />
              )}
            </FormattedMessage>
          </div>
        )}
      />
      <DatePicker
        inputVariant="outlined"
        onChange={handleChangeEndDate}
        minDate={getStartDateStringOrNull() || undefined}
        okLabel={<FormattedMessage id="global.ok" defaultMessage="OK" description="Generic label for a button or link for a user to press when they wish to confirm an action" />}
        cancelLabel={<FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />}
        value={getEndDateStringOrNull()}
        TextFieldComponent={({ onClick, value: valueText }) => (
          <div>
            <span className={classes.andText}>
              <FormattedMessage id="search.beforeDate" defaultMessage="and" description="String displayed between after and before date pickers" />
            </span>
            <FormattedMessage id="search.anyDate" defaultMessage="any date" description="Date picker placeholder">
              { text => (
                <StyledInputBaseDate
                  className={valueText ? ['date-range__end-date', classes.dateRangeFilterSelected].join(' ') : 'date-range__end-date'}
                  type="text"
                  style={{ width: `${setInputWidth(valueText.length)}px` }}
                  placeholder={text}
                  onClick={onClick}
                  value={valueText}
                  endAdornment={valueText ? <StyledCloseIcon onClick={e => handleClearDate(e, 'end_time')} /> : null}
                />
              )}
            </FormattedMessage>
          </div>
        )}
      />
    </>
  );
}

function DateRangeSelectorRelative(props) {
  const {
    classes,
    handleChangeRelativeQuantity,
    handleChangeRelativeRange,
    label,
    relativeQuantity,
    relativeRange,
  } = props;

  return (
    <>
      <FormattedMessage id="numericRangeFilter.enterNumber" defaultMessage="enter number" description="Placeholder text to tell the user to enter a number">
        { placeholder => (
          <TextField
            classes={{ root: classes.numericSelector }}
            InputProps={{ classes: { inputMarginDense: classes.inputMarginDense } }}
            variant="outlined"
            size="small"
            placeholder={placeholder}
            onChange={handleChangeRelativeQuantity}
            value={relativeQuantity}
            type="number"
          />
        )}
      </FormattedMessage>
      <Select
        onChange={handleChangeRelativeRange}
        value={relativeRange}
        input={
          <StyledInputBaseDropdown />
        }
      >
        <MenuItem value="d"> { label.relativeDays } </MenuItem>
        <MenuItem value="w"> { label.relativeWeeks } </MenuItem>
        <MenuItem value="m"> { label.relativeMonths } </MenuItem>
        <MenuItem value="y"> { label.relativeYears } </MenuItem>
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

  const label = {
    created_at: <FormattedMessage id="search.dateSubmittedHeading" defaultMessage="Request submitted" description="This is a header in a drop down selector, to filter a search by the submission date" />,
    media_published_at: <FormattedMessage id="search.dateLastSubmittedHeading" defaultMessage="Media published" description="This is a heading in a drop down selector, to filter a search by the last submitted date" />,
    updated_at: <FormattedMessage id="search.dateUpdatedHeading" defaultMessage="Item updated" description="This is a heading in a drop down selector, to filter a search by date updated" />,
    report_published_at: <FormattedMessage id="search.datePublishedHeading" defaultMessage="Report published" description="This is a heading in a drop down selector, to filter a search by a report published date" />,
    request_created_at: <FormattedMessage id="search.dateRequestHeading" defaultMessage="Request submitted" description="This is a heading in a drop down selector, to filter a search by request created dates" />,
    startEnd: <FormattedMessage id="search.dateStartEnd" defaultMessage="between" description="This is a label in a drop down selector, to filter a search by dates. The user selects a range of dates including a start and end date. In English this would be the first part of a phrase like 'Report published between February 3, 2022 and February 9, 2022'." />,
    lessThan: <FormattedMessage id="search.dateLessThan" defaultMessage="less than" description="This is a label in a drop down selector, to filter a search by dates. The dates are relative to the current day and in English this would be the first part of a phrase like 'Report published less than 10 months ago'." />,
    moreThan: <FormattedMessage id="search.dateMoreThan" defaultMessage="more than" description="This is a label in a drop down selector, to filter a search by dates. The dates are relative to the current day and in English this would be the first part of a phrase like 'Report published more than 10 months ago'." />,
    relativeDays: <FormattedMessage id="search.relativeDays" defaultMessage="days ago" description="This is a label in a drop down selector, and will appear a sentence format like 'Report published less than 3 days ago'." />,
    relativeWeeks: <FormattedMessage id="search.relativeWeeks" defaultMessage="weeks ago" description="This is a label in a drop down selector, and will appear a sentence format like 'Report published less than 3 weeks ago'." />,
    relativeMonths: <FormattedMessage id="search.relativeMonths" defaultMessage="months ago" description="This is a label in a drop down selector, and will appear a sentence format like 'Report published less than 3 months ago'." />,
    relativeYears: <FormattedMessage id="search.relativeYears" defaultMessage="years ago" description="This is a label in a drop down selector, and will appear a sentence format like 'Report published less than 3 years ago'." />,
  };

  return (
    <div className={classes.wrapper}>
      <FlexRow>
        <FormControl variant="outlined" className={classes.selectFormControl}>
          <FormLabel>{/* styling -- the <label> tag changes the height */}</FormLabel>
          <Select
            onChange={handleChangeType}
            value={getValueType()}
            input={
              <StyledInputBaseDropdown
                startAdornment={
                  <RemoveableWrapper icon={<DateRangeIcon />} onRemove={onRemove} />
                }
              />
            }
          >
            { ['created_at', 'media_published_at', 'updated_at', 'report_published_at', 'request_created_at'].filter(option => !optionsToHide.includes(option)).map(option => (
              <MenuItem value={option}>{ label[option] }</MenuItem>
            ))}
          </Select>
          <Select
            onChange={handleChangeRangeType}
            value={rangeType}
            input={
              <StyledInputBaseDropdown />
            }
          >
            <MenuItem value="startEnd"> { label.startEnd } </MenuItem>
            <MenuItem value="less_than"> { label.lessThan } </MenuItem>
            <MenuItem value="more_than"> { label.moreThan } </MenuItem>
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
              label,
              onRemove,
              relativeQuantity,
              relativeRange,
            }}
            />
          )}
        </FormControl>
      </FlexRow>
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
};

export default withStyles(Styles)(DateRangeFilter);
