import React from 'react';
import { FormattedMessage } from 'react-intl';
import { DatePicker } from '@material-ui/pickers';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { withStyles } from '@material-ui/core/styles';
import { StyledFilterRow } from './SearchQueryComponent';
import { FlexRow, units } from '../../styles/js/shared';
import globalStrings from '../../globalStrings';

const Styles = {
  selectFormControl: {
    flexShrink: 0,
  },
};

function buildValue(valueType, startTimeOrNull, endTimeOrNull) {
  if (startTimeOrNull === null && endTimeOrNull === null) {
    return null;
  }

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
    return (value && value.updated_at) ? 'updated_at' : 'created_at';
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

  render() {
    const { hidden, classes } = this.props;
    if (hidden) {
      return null;
    }

    const label = {
      date: <FormattedMessage id="search.dateHeading" defaultMessage="Date" />,
      created_at: <FormattedMessage id="search.dateCreatedHeading" defaultMessage="Created" />,
      updated_at: <FormattedMessage id="search.dateUpdatedHeading" defaultMessage="Updated" />,
    };

    return (
      <StyledFilterRow>
        <h4>{ label.date }</h4>
        <div>
          <FlexRow>
            <FormControl className={classes.selectFormControl}>
              <FormLabel>{/* styling -- the <label> tag changes the height */}</FormLabel>
              <Select onChange={this.handleChangeType} value={this.valueType}>
                <MenuItem value="created_at">
                  {label.created_at}
                </MenuItem>
                <MenuItem value="updated_at">
                  {label.updated_at}
                </MenuItem>
              </Select>
            </FormControl>
            <DatePicker
              label={<FormattedMessage id="search.pickDateFrom" defaultMessage="Starting date" />}
              className="date-range__start-date"
              onChange={this.handleChangeStartDate}
              maxDate={this.endDateStringOrNull || undefined}
              okLabel={<FormattedMessage {...globalStrings.ok} />}
              cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
              value={this.startDateStringOrNull}
              style={{ margin: `0 ${units(2)}` }}
            />
            <DatePicker
              label={<FormattedMessage id="search.pickDateTo" defaultMessage="Ending date" />}
              className="date-range__end-date"
              onChange={this.handleChangeEndDate}
              minDate={this.startDateStringOrNull || undefined}
              okLabel={<FormattedMessage {...globalStrings.ok} />}
              cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
              value={this.endDateStringOrNull}
              style={{ margin: `0 ${units(2)}` }}
            />
          </FlexRow>
        </div>
      </StyledFilterRow>
    );
  }
}

export default withStyles(Styles)(DateRangeFilter);
