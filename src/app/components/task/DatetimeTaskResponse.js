import React from 'react';
import { FormattedMessage, FormattedDate, injectIntl, intlShape, defineMessages } from 'react-intl';
import { convertNumbers2English } from '../../helpers';

const messages = defineMessages({
  timeIs: {
    id: 'datetimeTaskResponse.timeIs',
    defaultMessage: 'View this timezone on time.is',
  },
});

const DatetimeTaskResponse = (props) => {
  const response = convertNumbers2English(props.response);
  const values = response.match(/^(\d+-\d+-\d+) (\d+):(\d+) ([+-]?\d+) (.*)$/);
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

  const formattedDate = <FormattedDate value={date} day="numeric" month="long" year="numeric" />;

  return (
    <span className="task__datetime-response">
      {noTime
        ? formattedDate
        : <FormattedMessage
          id="datetimeTaskResponse.taskResponse"
          defaultMessage={'{date} at {timeLink}'}
          values={{
            date: formattedDate,
            timeLink: (
              <a
                href={`https://time.is/${values[1]} ${time}`}
                target="_blank"
                rel="noreferrer noopener"
                title={props.intl.formatMessage(messages.timeIs)}
              >
                {time}
              </a>
              ),
          }}
        />}
    </span>
  );
};

DatetimeTaskResponse.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(DatetimeTaskResponse);
