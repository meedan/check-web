import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { DatePicker } from '@material-ui/pickers';
import InputBase from '@material-ui/core/InputBase';
import { withStyles } from '@material-ui/core/styles';
import { FlexRow, units, opaqueBlack07, checkBlue } from '../../styles/js/shared';
import globalStrings from '../../globalStrings';

const StyledInputBase = withStyles(theme => ({
  root: {
    backgroundColor: opaqueBlack07,
    padding: `0 ${theme.spacing(0.5)}px`,
    height: theme.spacing(4.5),
    fontSize: 14,
    width: 175,
  },
}))(InputBase);

const StyledInputBaseDate = withStyles(() => ({
  root: {
    width: 110,
  },
}))(StyledInputBase);

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

function buildValue(startTimeOrNull, endTimeOrNull) {
  const range = {};
  if (startTimeOrNull) {
    range.start_time = startTimeOrNull;
  }
  if (endTimeOrNull) {
    range.end_time = endTimeOrNull;
  }
}

function parseStartDateAsISOString(moment) {
  const date = moment.toDate();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
}

function parseEndDateAsISOString(moment) {
  const date = moment.toDate();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString();
}

class AnnotationFilterDate extends React.Component {
  getDateStringOrNull(field) {
    const { value } = this.props;
    return (value && value[field]) || null;
  }

  get startDateStringOrNull() {
    return this.getDateStringOrNull('start_time');
  }

  get endDateStringOrNull() {
    return this.getDateStringOrNull('end_time');
  }

  handleChangeStartDate = (moment) => {
    console.log('moment', moment); // eslint-disable-line no-console
    this.props.onChange(['DATE_RANGE'], buildValue(
      parseStartDateAsISOString(moment),
      this.endDateStringOrNull,
    ));
  }

  handleChangeEndDate = (moment) => {
    this.props.onChange(['DATE_RANGE'], buildValue(
      this.startDateStringOrNull,
      parseEndDateAsISOString(moment),
    ));
  }

  render() {
    console.log('I am here ....', this.props); // eslint-disable-line no-console
    const { classes } = this.props;

    return (
      <div style={{ background: opaqueBlack07 }}>
        <FlexRow>
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

AnnotationFilterDate.defaultProps = {
  value: null,
  onError: null,
};

AnnotationFilterDate.propTypes = {
  classes: PropTypes.object.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.shape({
      start_time: PropTypes.string,
      end_time: PropTypes.string,
    }),
  ]),
  onChange: PropTypes.func.isRequired,
  onError: PropTypes.func,
};

export default withStyles(Styles)(AnnotationFilterDate);
