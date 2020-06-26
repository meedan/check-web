import React from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { convertNumbers2English } from '../../helpers';

const DatetimeTaskResponse = (props) => {
  if (!props.response) {
    return null;
  }

  const response = convertNumbers2English(props.response);
  const values = response.match(/^(\d+-\d+-\d+) (\d+):(\d+) ([+-]?\d+) (.*)$/);

  if (!values) {
    return <FormattedMessage id="datetimeTaskResponse.invalidTimestamp" defaultMessage="Error: Invalid timestamp" />;
  }

  const noTime = /notime/.test(response);
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

  return (
    <span className="task__datetime-response">
      {noTime ? (
        <FormattedDate value={date} day="numeric" month="long" year="numeric" />
      ) : (
        <FormattedMessage
          id="datetimeTaskResponse.taskResponse"
          defaultMessage="{date} at {timeLink}"
          values={{
            date: <FormattedDate value={date} day="numeric" month="long" year="numeric" />,
            timeLink: (
              <a
                href={`https://time.is/${values[1]} ${time}`}
                target="_blank"
                rel="noreferrer noopener"
                title={
                  <FormattedMessage
                    id="datetimeTaskResponse.timeIs"
                    defaultMessage="View this timezone on time.is"
                  />
                }
              >
                {time}
              </a>
            ),
          }}
        />
      )}
    </span>
  );
};

export default DatetimeTaskResponse;
