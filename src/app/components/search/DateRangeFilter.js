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
import DateRangeIcon from '@material-ui/icons/DateRange';
import CloseIcon from '@material-ui/icons/Close';
import RemoveableWrapper from './RemoveableWrapper';
import { FlexRow, units, opaqueBlack07, checkBlue } from '../../styles/js/shared';
import globalStrings from '../../globalStrings';

const StyledCloseIcon = withStyles({
  root: {
    fontSize: '12px',
    cursor: 'pointer',
    padding: '4px',
    width: '24px',
    height: '24px',
  },
})(CloseIcon);

const StyledInputBaseDate = withStyles(theme => ({
  root: {
    backgroundColor: opaqueBlack07,
    padding: `0 ${theme.spacing(0.5)}px`,
    height: theme.spacing(4.5),
    fontSize: 14,
    width: 150,
  },
  input: {
    padding: '4px 0 4px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
}))(InputBase);

const StyledInputBaseDropdown = withStyles(theme => ({
  root: {
    backgroundColor: opaqueBlack07,
    padding: `0 ${theme.spacing(0.5)}px`,
    height: theme.spacing(4.5),
    fontSize: 14,
    borderRadius: '4px',
    '& .MuiSelect-icon': {
      color: 'white',
    },
  },
  input: {
    backgroundColor: checkBlue,
    color: 'white',
    paddingLeft: theme.spacing(1),
    '&:focus': {
      backgroundColor: checkBlue,
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
    backgroundColor: checkBlue,
    color: 'white',
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
    backgroundColor: opaqueBlack07,
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
        okLabel={<FormattedMessage {...globalStrings.ok} />}
        cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
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
        okLabel={<FormattedMessage {...globalStrings.ok} />}
        cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
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
      <FormattedMessage id="numericRangeFilter.enterNumber" defaultMessage="enter number">
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
  onChange,
  onRemove,
}) => {
  const getValueType = () => {
    if (value && value.updated_at) return 'updated_at';
    if (value && value.media_published_at) return 'media_published_at';
    if (value && value.report_published_at) return 'report_published_at';
    return 'created_at';
  };
  const rangeTypes = {
    startEnd: 'startEnd',
    relative: 'relative',
  };
  const getInitialRangeType = () => {
    if (value && value[getValueType()]?.condition) return rangeTypes.relative;
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

  const buildValueRelative = (valueType, relativeQuantityValue, relativeRangeValue) => ({
    [valueType]: {
      condition: 'less_than',
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
    } else if (rangeType === rangeTypes.relative) {
      onChange(buildValueRelative(
        valueType,
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
    } else if (valueRangeType === rangeTypes.relative) {
      onChange(buildValueRelative(
        getValueType(),
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
      relativeQuantity,
      valueRelativeRange,
    ));
  };

  const handleChangeRelativeQuantity = (e) => {
    const valueRelativeQuantity = e.target.value;
    setRelativeQuantity(valueRelativeQuantity);
    onChange(buildValueRelative(
      getValueType(),
      valueRelativeQuantity,
      relativeRange,
    ));
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
    created_at: <FormattedMessage id="search.dateSubmittedHeading" defaultMessage="Media submitted" />,
    media_published_at: <FormattedMessage id="search.dateLastSubmittedHeading" defaultMessage="Media published" />,
    updated_at: <FormattedMessage id="search.dateUpdatedHeading" defaultMessage="Item updated" />,
    report_published_at: <FormattedMessage id="search.datePublishedHeading" defaultMessage="Report published" />,
    startEnd: <FormattedMessage id="search.dateStartEnd" defaultMessage="between" description="This is a label in a drop down selector, to filter a search by dates. The user selects a range of dates including a start and end date. In English this would be the first part of a phrase like 'Report published between February 3, 2022 and February 9, 2022'." />,
    relative: <FormattedMessage id="search.dateRelative" defaultMessage="less than" description="This is a label in a drop down selector, to filter a search by dates. The dates are relative to the current day and in English this would be the first part of a phrase like 'Report published less than 10 months ago'." />,
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
                  <RemoveableWrapper icon={<DateRangeIcon />} onRemove={onRemove} boxProps={{ pr: 1 }} />
                }
              />
            }
          >
            <MenuItem value="created_at"> { label.created_at } </MenuItem>
            <MenuItem value="media_published_at"> { label.media_published_at } </MenuItem>
            <MenuItem value="updated_at"> { label.updated_at } </MenuItem>
            <MenuItem value="report_published_at"> { label.report_published_at } </MenuItem>
          </Select>
          <Select
            onChange={handleChangeRangeType}
            value={rangeType}
            input={
              <StyledInputBaseDropdown />
            }
          >
            <MenuItem value="startEnd"> { label.startEnd } </MenuItem>
            <MenuItem value="relative"> { label.relative } </MenuItem>
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
};

DateRangeFilter.propTypes = {
  classes: PropTypes.object.isRequired,
  hide: PropTypes.bool,
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
  ]),
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default withStyles(Styles)(DateRangeFilter);
