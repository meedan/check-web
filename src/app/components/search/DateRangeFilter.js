import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import DatePicker from 'material-ui/DatePicker';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import { StyledFilterRow } from './SearchQueryComponent';
import { FlexRow, units } from '../../styles/js/shared';
import globalStrings from '../../globalStrings';

class DateRangeFilter extends React.Component {
  constructor(props) {
    super(props);

    const { value } = this.props;
    const type = (value && Object.keys(value)[0]) || null;

    this.state = {
      type: type || 'created_at',
      value: value && type ? { ...value[type] } : {},
    };
  }

  componentWillUpdate = (nextProps) => {
    if (this.props.value !== nextProps.value && nextProps.value === undefined) {
      this.setState({ type: 'created_at', value: {} });
    }
  };

  handleChangeDate = (date, field) => {
    const value = Object.assign({}, this.state.value);
    value[field] = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    this.setState({ value });

    if (this.props.onChange) {
      const result = {};
      result[this.state.type] = value;
      this.props.onChange(result);
    }
  };

  handleChangeType = (e) => {
    const type = e.target.value;
    this.setState({ type });

    if (this.props.onChange) {
      const result = {};
      result[type] = this.state.value;
      this.props.onChange(result);
    }
  };

  shouldDisableDate = (date, field) => {
    const { start_time, end_time } = this.state.value;

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

    const { start_time, end_time } = this.state.value;

    const label = {
      date: <FormattedMessage id="search.dateHeading" defaultMessage="Date" />,
      created_at: <FormattedMessage id="search.dateCreatedHeading" defaultMessage="Created At" />,
      updated_at: <FormattedMessage id="search.dateUpdatedHeading" defaultMessage="Updated At" />,
    };

    return (
      <StyledFilterRow doubleHeight isRtl={this.props.isRtl}>
        <h4>{ label.date }</h4>
        <div style={{ width: units(60) }}>
          <FlexRow>
            <Select
              input={<OutlinedInput />}
              onChange={this.handleChangeType}
              value={this.state.type}
              style={{ minWidth: units(18) }}
              labelWidth={0}
            >
              <MenuItem value="created_at">
                {label.created_at}
              </MenuItem>
              <MenuItem value="updated_at">
                {label.updated_at}
              </MenuItem>
            </Select>
            <DatePicker
              floatingLabelText={
                <FormattedMessage
                  id="search.pickDateFrom"
                  defaultMessage="Starting date"
                />
              }
              onChange={(e, date) => this.handleChangeDate(date, 'start_time')}
              shouldDisableDate={date => this.shouldDisableDate(date, 'start_time')}
              okLabel={this.props.intl.formatMessage(globalStrings.ok)}
              cancelLabel={this.props.intl.formatMessage(globalStrings.cancel)}
              mode="landscape"
              textFieldStyle={{ width: units(18) }}
              value={start_time && new Date(start_time)}
            />
            <DatePicker
              floatingLabelText={
                <FormattedMessage
                  id="search.pickDateTo"
                  defaultMessage="Ending date"
                />
              }
              onChange={(e, date) => this.handleChangeDate(date, 'end_time')}
              shouldDisableDate={date => this.shouldDisableDate(date, 'end_time')}
              okLabel={this.props.intl.formatMessage(globalStrings.ok)}
              cancelLabel={this.props.intl.formatMessage(globalStrings.cancel)}
              mode="landscape"
              textFieldStyle={{ width: units(18) }}
              value={end_time && new Date(end_time)}
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
