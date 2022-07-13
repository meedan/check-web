/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { DatePicker } from '@material-ui/pickers';
import InputBase from '@material-ui/core/InputBase';
import { withStyles } from '@material-ui/core/styles';
import CloseIcon from '@material-ui/icons/Close';
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
  return { range };
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
    const { query, teamTask } = this.props;
    const teamTaskValue = query.team_tasks.find(tt => tt.id.toString() === teamTask.node.dbid.toString());
    const { range } = teamTaskValue;
    const value = range && range[field] !== undefined ? range[field] : null;
    return value;
  }

  get startDateStringOrNull() {
    return this.getDateStringOrNull('start_time');
  }

  get endDateStringOrNull() {
    return this.getDateStringOrNull('end_time');
  }

  handleChangeStartDate = (moment) => {
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

  handleClearDate = (event, field) => {
    event.stopPropagation();
    const { query, teamTask } = this.props;
    const teamTaskValue = query.team_tasks.find(tt => tt.id.toString() === teamTask.node.dbid.toString());
    const { range } = teamTaskValue;
    range[field] = null;
    this.props.onChange(['DATE_RANGE'], { range });
  }

  render() {
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

export default withStyles(Styles)(AnnotationFilterDate);
