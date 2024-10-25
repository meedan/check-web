import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Select from '../cds/inputs/Select';
import CalendarIcon from '../../icons/calendar_month.svg';

const TimeFrameSelect = ({
  onChange,
  value,
}) => (
  <Select
    iconLeft={<CalendarIcon />}
    value={value}
    onChange={onChange}
  >
    <FormattedMessage
      defaultMessage="Last: 7 days"
      description="Label for the last week option in the timeframe select"
      id="timeframeSelect.pastWeek"
    >
      { text => <option value="past_week">{text}</option> }
    </FormattedMessage>
    <FormattedMessage
      defaultMessage="Last: 14 days"
      description="Label for the last 2 weeks option in the timeframe select"
      id="timeframeSelect.past2Weeks"
    >
      { text => <option value="past_2_weeks">{text}</option> }
    </FormattedMessage>
    <FormattedMessage
      defaultMessage="Last: 30 days"
      description="Label for the last month option in the timeframe select"
      id="timeframeSelect.pastMonth"
    >
      { text => <option value="past_month">{text}</option> }
    </FormattedMessage>
    <FormattedMessage
      defaultMessage="Last: 90 days"
      description="Label for the last 3 months option in the timeframe select"
      id="timeframeSelect.past3Months"
    >
      { text => <option value="past_3_months">{text}</option> }
    </FormattedMessage>
    <FormattedMessage
      defaultMessage="Last: 180 days"
      description="Label for the last 6 months option in the timeframe select"
      id="timeframeSelect.past6Months"
    >
      { text => <option value="past_6_months">{text}</option> }
    </FormattedMessage>
    <FormattedMessage
      defaultMessage="Year to date"
      description="Label for the year to date option in the timeframe select"
      id="timeframeSelect.yearToDate"
    >
      { text => <option value="year_to_date">{text}</option> }
    </FormattedMessage>
  </Select>
);

TimeFrameSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default TimeFrameSelect;
