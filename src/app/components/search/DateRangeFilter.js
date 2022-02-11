/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { DatePicker } from '@material-ui/pickers';
import FormControl from '@material-ui/core/FormControl';
import InputBase from '@material-ui/core/InputBase';
import FormLabel from '@material-ui/core/FormLabel';
import MenuItem from '@material-ui/core/MenuItem';
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

const Styles = {
  selectFormControl: {
    flexShrink: 0,
  },
  dateRangeFilterSelected: {
    backgroundColor: checkBlue,
    color: 'white',
    height: 24,
    margin: '6px 3px',
    borderRadius: 2,
  },
};

function buildValue(valueType, startTimeOrNull, endTimeOrNull) {
  const range = {};
  if (startTimeOrNull) {
    range.start_time = startTimeOrNull;
  }
  if (endTimeOrNull) {
    range.end_time = endTimeOrNull;
  }
  return { [valueType]: range };
}

function parseStartDateAsISOString(moment) {
  const date = moment.toDate();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
}

function parseEndDateAsISOString(moment) {
  const date = moment.toDate();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString();
}

class DateRangeFilter extends React.Component {
  get valueType() {
    const { value } = this.props;
    if (value && value.updated_at) return 'updated_at';
    if (value && value.last_seen) return 'last_seen';
    if (value && value.published_at) return 'published_at';
    return 'created_at';
  }

  getDateStringOrNull(field) {
    const { value } = this.props;
    return (value && value[this.valueType][field]) || null;
  }

  get startDateStringOrNull() {
    return this.getDateStringOrNull('start_time');
  }

  get endDateStringOrNull() {
    return this.getDateStringOrNull('end_time');
  }

  handleChangeStartDate = (moment) => {
    this.props.onChange(buildValue(
      this.valueType,
      parseStartDateAsISOString(moment),
      this.endDateStringOrNull,
    ));
  }

  handleChangeEndDate = (moment) => {
    this.props.onChange(buildValue(
      this.valueType,
      this.startDateStringOrNull,
      parseEndDateAsISOString(moment),
    ));
  }

  handleChangeType = (e) => {
    const valueType = e.target.value;
    this.props.onChange(buildValue(
      valueType,
      this.startDateStringOrNull,
      this.endDateStringOrNull,
    ));
  }

  handleClearDate = (event, field) => {
    event.stopPropagation();
    if (field === 'start_time') {
      this.props.onChange(buildValue(
        this.valueType,
        null,
        this.endDateStringOrNull,
      ));
    } else {
      this.props.onChange(buildValue(
        this.valueType,
        this.startDateStringOrNull,
        null,
      ));
    }
  }

  render() {
    const { hide, classes, onRemove } = this.props;

    if (hide) {
      return null;
    }

    const label = {
      created_at: <FormattedMessage id="search.dateSubmittedHeading" defaultMessage="Submitted" />,
      last_seen: <FormattedMessage id="search.dateLastSubmittedHeading" defaultMessage="Last submitted" />,
      updated_at: <FormattedMessage id="search.dateUpdatedHeading" defaultMessage="Updated" />,
      published_at: <FormattedMessage id="search.datePublishedHeading" defaultMessage="Published" />,
    };

    return (
      <div style={{ background: opaqueBlack07 }}>
        <FlexRow>
          <FormControl variant="outlined" className={classes.selectFormControl}>
            <FormLabel>{/* styling -- the <label> tag changes the height */}</FormLabel>
            <Select
              onChange={this.handleChangeType}
              value={this.valueType}
              input={
                <StyledInputBaseDate
                  startAdornment={
                    <RemoveableWrapper icon={<DateRangeIcon />} onRemove={onRemove} boxProps={{ pr: 1 }} />
                  }
                />
              }
            >
              <MenuItem value="created_at"> { label.created_at } </MenuItem>
              <MenuItem value="last_seen"> { label.last_seen } </MenuItem>
              <MenuItem value="updated_at"> { label.updated_at } </MenuItem>
              <MenuItem value="published_at"> { label.published_at } </MenuItem>
            </Select>
          </FormControl>
          <DatePicker
            onChange={this.handleChangeStartDate}
            maxDate={this.endDateStringOrNull || undefined}
            okLabel={<FormattedMessage {...globalStrings.ok} />}
            cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
            value={this.startDateStringOrNull}
            style={{ margin: `0 ${units(2)}` }}
            TextFieldComponent={({ onClick, value, onChange }) => (
              <div>
                <FormattedMessage id="search.afterDate" defaultMessage="after" description="String displayed before a date picker" />
                {' '}
                <FormattedMessage id="search.anyDate" defaultMessage="any date" description="Date picker placeholder">
                  { text => (
                    <StyledInputBaseDate
                      className={value ? ['date-range__start-date', classes.dateRangeFilterSelected].join(' ') : 'date-range__start-date'}
                      type="text"
                      placeholder={text}
                      onClick={onClick}
                      value={value}
                      onChange={onChange}
                      endAdornment={value ? <StyledCloseIcon onClick={e => this.handleClearDate(e, 'start_time')} /> : null}
                    />
                  )}
                </FormattedMessage>
              </div>
            )}
          />
          <DatePicker
            inputVariant="outlined"
            onChange={this.handleChangeEndDate}
            minDate={this.startDateStringOrNull || undefined}
            okLabel={<FormattedMessage {...globalStrings.ok} />}
            cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
            value={this.endDateStringOrNull}
            TextFieldComponent={({ onClick, value, onChange }) => (
              <div>
                <FormattedMessage id="search.beforeDate" defaultMessage="and before" description="String displayed between after and before date pickers" />
                {' '}
                <FormattedMessage id="search.anyDate" defaultMessage="any date" description="Date picker placeholder">
                  { text => (
                    <StyledInputBaseDate
                      className={value ? ['date-range__end-date', classes.dateRangeFilterSelected].join(' ') : 'date-range__end-date'}
                      type="text"
                      placeholder={text}
                      onClick={onClick}
                      value={value}
                      onChange={onChange}
                      endAdornment={value ? <StyledCloseIcon onClick={e => this.handleClearDate(e, 'end_time')} /> : null}
                    />
                  )}
                </FormattedMessage>
              </div>
            )}
          />
        </FlexRow>
      </div>
    );
  }
}

DateRangeFilter.defaultProps = {
  hide: false,
  value: null,
};

DateRangeFilter.propTypes = {
  classes: PropTypes.object.isRequired,
  hide: PropTypes.bool,
  value: PropTypes.oneOfType([
    PropTypes.shape({
      created_at: PropTypes.shape({
        start_time: PropTypes.string,
        end_time: PropTypes.string,
      }),
    }),
    PropTypes.shape({
      last_seen: PropTypes.shape({
        start_time: PropTypes.string,
        end_time: PropTypes.string,
      }),
    }),
    PropTypes.shape({
      updated_at: PropTypes.shape({
        start_time: PropTypes.string,
        end_time: PropTypes.string,
      }),
    }),
    PropTypes.shape({
      published_at: PropTypes.shape({
        start_time: PropTypes.string,
        end_time: PropTypes.string,
      }),
    }),
  ]),
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default withStyles(Styles)(DateRangeFilter);
