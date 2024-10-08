import React from 'react';
import Select from '../cds/inputs/Select';
import CalendarIcon from '../../icons/calendar_month.svg';

const TimeFrameSelect = () => (
  <Select
    iconLeft={<CalendarIcon />}
    onChange={() => {}}
  >
    <option value="last-week">Last: 7 days</option>
  </Select>
);

export default TimeFrameSelect;
