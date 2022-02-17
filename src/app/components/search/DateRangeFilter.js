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
    width: 175,
  },
}))(InputBase);

const StyledInputBaseDropdown = withStyles(theme => ({
  root: {
    backgroundColor: opaqueBlack07,
    padding: `0 ${theme.spacing(0.5)}px`,
    height: theme.spacing(4.5),
    fontSize: 14,
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
  },
}))(InputBase);

const Styles = {
  selectFormControl: {
    flexDirection: 'row',
    flexShrink: 0,
    alignItems: 'center',
    paddingRight: '4px',
  },
  dateRangeFilterSelected: {
    backgroundColor: checkBlue,
    color: 'white',
    height: 24,
    margin: '6px 3px',
    borderRadius: 2,
  },
  inputMarginDense: {
    padding: '4px 8px',
  },
  numericSelector: {
    maxWidth: '100px',
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
    none: '',
  };
  const getInitialRangeType = () => {
    if (value && value[getValueType()]?.condition) return rangeTypes.relative;
    if (value && value[getValueType()]?.start_time) return rangeTypes.startEnd;
    return rangeTypes.none;
  };
  const [rangeType, setRangeType] = React.useState(getInitialRangeType());
  const relativeRanges = {
    days: 'd',
    weeks: 'w',
    months: 'm',
    years: 'y',
  };
  const [relativeRange, setRelativeRange] = React.useState((value && value[getValueType()]?.period_type) || relativeRanges.days);
  const [relativeQuantity, setRelativeQuantity] = React.useState((value && value[getValueType()]?.period) || 0);

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
      period: relativeQuantityValue,
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
    const valueRelativeQuantity = +e.target.value;
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
    startEnd: <FormattedMessage id="search.dateStartEnd" defaultMessage="Is between..." description="This is a label in a drop down selector, to filter a search by dates. The user selects a range of dates including a start and end date. In English this would be the first part of a phrase like 'Is between... February 3, 2022 and February 9, 2022'." />,
    relative: <FormattedMessage id="search.dateRelative" defaultMessage="Is less than..." description="This is a label in a drop down selector, to filter a search by dates. The dates are relative to the current day and in English this would be the first part of a phrase like 'Is less than... 3 days'." />,
    relativeDays: <FormattedMessage id="search.relativeDays" defaultMessage="days" description="This is a label in a drop down selector, and will appear a sentence format like 'Is less than... 3 days'." />,
    relativeWeeks: <FormattedMessage id="search.relativeWeeks" defaultMessage="weeks" description="This is a label in a drop down selector, and will appear a sentence format like 'Is less than... 3 weeks'." />,
    relativeMonths: <FormattedMessage id="search.relativeMonths" defaultMessage="months" description="This is a label in a drop down selector, and will appear a sentence format like 'Is less than... 3 months'." />,
    relativeYears: <FormattedMessage id="search.relativeYears" defaultMessage="years" description="This is a label in a drop down selector, and will appear a sentence format like 'Is less than... 3 years'." />,
  };

  const DateRangeSelector = () => {
    if (rangeType === rangeTypes.startEnd) {
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
                <FormattedMessage id="search.afterDate" defaultMessage="after" description="String displayed before a date picker" />
                {' '}
                <FormattedMessage id="search.anyDate" defaultMessage="any date" description="Date picker placeholder">
                  { text => (
                    <StyledInputBaseDate
                      className={valueText ? ['date-range__start-date', classes.dateRangeFilterSelected].join(' ') : 'date-range__start-date'}
                      type="text"
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
                <FormattedMessage id="search.beforeDate" defaultMessage="and before" description="String displayed between after and before date pickers" />
                {' '}
                <FormattedMessage id="search.anyDate" defaultMessage="any date" description="Date picker placeholder">
                  { text => (
                    <StyledInputBaseDate
                      className={valueText ? ['date-range__end-date', classes.dateRangeFilterSelected].join(' ') : 'date-range__end-date'}
                      type="text"
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
    } else if (rangeType === 'relative') {
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
              <StyledInputBaseDropdown
                startAdornment={
                  <RemoveableWrapper onRemove={onRemove} boxProps={{ pr: 1 }} />
                }
              />
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
    return null;
  };

  return (
    <div style={{ background: opaqueBlack07 }}>
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
              <StyledInputBaseDropdown
                startAdornment={
                  <RemoveableWrapper onRemove={onRemove} boxProps={{ pr: 1 }} />
                }
              />
            }
          >
            <MenuItem value="startEnd"> { label.startEnd } </MenuItem>
            <MenuItem value="relative"> { label.relative } </MenuItem>
          </Select>
          <DateRangeSelector />
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
