import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { DatePicker } from '@material-ui/pickers';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { StyledFilterRow } from './SearchQueryComponent';
import { FlexRow, units, checkBlue } from '../../styles/js/shared';
import globalStrings from '../../globalStrings';

class DateRangeFilter extends React.Component {
  getRange = () => {
    const type = this.props.value ? Object.keys(this.props.value)[0] : 'created_at';
    const value = this.props.value ? this.props.value[type] : {};
    return { type, value };
  };

  handleChangeDate = (moment, field) => {
    const range = this.getRange();
    const date = moment.toDate();

    if (field === 'start_time') {
      range.value[field] =
        new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    } else if (field === 'end_time') {
      range.value[field] =
        new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59).toISOString();
    }

    if (this.props.onChange) {
      const result = {};
      result[range.type] = range.value;
      this.props.onChange(result);
    }
  };

  handleChangeType = (e) => {
    const newType = e.target.value;
    const range = this.getRange();

    if (this.props.onChange) {
      const result = {};
      result[newType] = range.value;
      this.props.onChange(result);
    }
  };

  shouldDisableDate = (date, field) => {
    const range = this.getRange();
    const { start_time, end_time } = range.value;

    if (field === 'start_time') {
      return (end_time && date > new Date(end_time));
    }

    if (field === 'end_time') {
      return (start_time && date < new Date(start_time));
    }

    return false;
  };

  render() {
    if (this.props.hidden) {
      return null;
    }

    const range = this.getRange();
    const { start_time, end_time } = range.value;

    const label = {
      date: <FormattedMessage id="search.dateHeading" defaultMessage="Date" />,
      created_at: <FormattedMessage id="search.dateCreatedHeading" defaultMessage="Created" />,
      updated_at: <FormattedMessage id="search.dateUpdatedHeading" defaultMessage="Updated" />,
    };

    const isActive = start_time || end_time;
    const selectStyle = {
      minWidth: units(18),
      fontSize: 'small',
    };
    if (isActive) {
      selectStyle.border = `${checkBlue} 3px solid`;
      selectStyle.borderRadius = units(1);
    }

    return (
      <StyledFilterRow height={units(9)} overflowY="hidden" isRtl={this.props.isRtl}>
        <h4>{ label.date }</h4>
        <div style={{ width: units(60) }}>
          <FlexRow>
            <Select
              className="date-range__select-root"
              input={<OutlinedInput />}
              onChange={this.handleChangeType}
              value={range.type}
              style={selectStyle}
              labelWidth={0}
              classes={{ select: 'date-range__select-menu' }}
              margin="dense"
            >
              <MenuItem
                className="date-range__created"
                value="created_at"
                style={{
                  fontSize: 'small',
                  padding: units(0.5),
                }}
              >
                {label.created_at}
              </MenuItem>
              <MenuItem
                className="date-range__updated"
                value="updated_at"
                style={{
                  fontSize: 'small',
                  padding: units(0.5),
                }}
              >
                {label.updated_at}
              </MenuItem>
            </Select>
            <DatePicker
              label={
                <FormattedMessage
                  id="search.pickDateFrom"
                  defaultMessage="Starting date"
                />
              }
              className="date-range__start-date"
              onChange={date => this.handleChangeDate(date, 'start_time')}
              shouldDisableDate={date => this.shouldDisableDate(date, 'start_time')}
              okLabel={this.props.intl.formatMessage(globalStrings.ok)}
              cancelLabel={this.props.intl.formatMessage(globalStrings.cancel)}
              value={start_time ? new Date(start_time) : null}
              style={{ margin: `0 ${units(2)}` }}
            />
            <DatePicker
              label={
                <FormattedMessage
                  id="search.pickDateTo"
                  defaultMessage="Ending date"
                />
              }
              className="date-range__end-date"
              onChange={date => this.handleChangeDate(date, 'end_time')}
              shouldDisableDate={date => this.shouldDisableDate(date, 'end_time')}
              okLabel={this.props.intl.formatMessage(globalStrings.ok)}
              cancelLabel={this.props.intl.formatMessage(globalStrings.cancel)}
              value={end_time ? new Date(end_time) : null}
              style={{ margin: `0 ${units(2)}` }}
            />
          </FlexRow>
        </div>
      </StyledFilterRow>
    );
  }
}

DateRangeFilter.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(DateRangeFilter);
