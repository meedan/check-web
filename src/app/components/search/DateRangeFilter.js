import React from 'react';
import PropTypes from 'prop-types';
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

  render() {
    const { hide, classes } = this.props;
    if (hide) {
      return null;
    }

    const label = {
      date: <FormattedMessage id="search.dateHeading" defaultMessage="Date" />,
      created_at: <FormattedMessage id="search.dateSubmittedHeading" defaultMessage="Submitted" />,
      last_seen: <FormattedMessage id="search.dateLastSubmittedHeading" defaultMessage="Last submitted" />,
      updated_at: <FormattedMessage id="search.dateUpdatedHeading" defaultMessage="Updated" />,
    };

    return (
      <StyledFilterRow>
        <h4>{ label.date }</h4>
        <div>
          <FlexRow>
            <FormControl variant="outlined" className={classes.selectFormControl}>
              <FormLabel>{/* styling -- the <label> tag changes the height */}</FormLabel>
              <Select onChange={this.handleChangeType} value={this.valueType}>
                <MenuItem value="created_at">
                  {label.created_at}
                </MenuItem>
                <MenuItem value="last_seen">
                  {label.last_seen}
                </MenuItem>
                <MenuItem value="updated_at">
                  {label.updated_at}
                </MenuItem>
              </Select>
            </FormControl>
            <DatePicker
              inputVariant="outlined"
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
              inputVariant="outlined"
              label={<FormattedMessage id="search.pickDateTo" defaultMessage="Ending date" />}
              className="date-range__end-date"
              onChange={this.handleChangeEndDate}
              minDate={this.startDateStringOrNull || undefined}
              okLabel={<FormattedMessage {...globalStrings.ok} />}
              cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
              value={this.endDateStringOrNull}
            />
          </FlexRow>
        </div>
      </StyledFilterRow>
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
  ]),
  onChange: PropTypes.func.isRequired,
};

export default withStyles(Styles)(DateRangeFilter);
