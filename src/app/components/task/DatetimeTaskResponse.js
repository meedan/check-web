import React, { Component } from 'react';
import { FormattedMessage, FormattedDate, injectIntl, intlShape, defineMessages } from 'react-intl';

const messages = defineMessages({
  timeIs: {
    id: 'datetimeTaskResponse.timeIs',
    defaultMessage: 'View this timezone on time.is',
  },
});

class DatetimeTaskResponse extends Component {
  render() {
    const values = this.props.response.match(/^(\d+-\d+-\d+) (\d+):(\d+) ([+-]?\d+) (.*)$/);
    let hour = parseInt(values[2], 10);
    let minute = parseInt(values[3], 10);
    if (hour < 10) {
      hour = `0${hour}`;
    }
    if (minute < 10) {
      minute = `0${minute}`;
    }
    const date = new Date(`${values[1]} 00:00`); // Make sure we get the real day and not the day before or after
    const time = `${hour}:${minute} ${values[5]}`;

    const formattedDate = <FormattedDate value={date} day="numeric" month="long" year="numeric" />;

    return (
      <span className="task__datetime-response">
        { (hour === '00' && minute === '00') ? formattedDate :
        <FormattedMessage
          id="datetimeTaskResponse.taskResponse" defaultMessage={'{date} at {timeLink}'} values={{
            date: formattedDate,
            timeLink: <a href={`https://time.is/${time}`} target="_blank" rel="noreferrer noopener" title={this.props.intl.formatMessage(messages.timeIs)}>{time}</a>,
          }}
        /> }
      </span>
    );
  }
}

DatetimeTaskResponse.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DatetimeTaskResponse);
