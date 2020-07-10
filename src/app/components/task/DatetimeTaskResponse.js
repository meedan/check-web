import React from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import { convertNumbers2English } from '../../helpers';

const DateDisplay = ({ isoDate }) => (
  <time dateTime={isoDate}>
    <FormattedDate value={new Date(isoDate)} day="numeric" month="long" year="numeric" />
  </time>
);

function tzOffsetHoursToIso8601Offset(nHours) {
  if (nHours === 0) {
    return 'Z';
  }

  const sign = nHours > 0 ? '+' : '-';
  return `${sign}${String(Math.abs(nHours)).padStart(2, '0')}:00`;
}

function DateTimeDisplay({
  isoDate, hourString, minuteString, tzOffsetHours, tzString,
}) {
  const dateString = `${isoDate}T${hourString.padStart(2, '0')}:${minuteString.padStart(2, '0')}`;
  const iso8601TzOffset = tzOffsetHoursToIso8601Offset(tzOffsetHours);
  const date = new Date(`${dateString}${iso8601TzOffset}`);
  // We can't format `date`, because we don't know its timezone. All we
  // have is its offset, and that isn't enough: `Intl.DateTimeFormat` needs
  // an IANA timezone.  TODO fix https://mantis.meedan.com/view.php?id=8437,
  // then format with `value={date}`.

  // `Date.parse("YYYY-MM-DDThh:mm")` will parse in user's local timezone.
  // This date may not exist! Hence https://mantis.meedan.com/view.php?id=8437
  const displayDate = new Date(dateString);
  const urlDate = encodeURIComponent(`${isoDate} ${hourString}:${minuteString} ${tzString}`);
  return (
    <time dateTime={date.toISOString()}>
      <FormattedDate
        value={displayDate /* https://mantis.meedan.com/view.php?id=8437 */}
        year="numeric"
        month="long"
        day="numeric"
        hour="numeric"
        minute="numeric"
      />
      {' '}
      <FormattedMessage
        id="datetimeTaskResponse.timeIs"
        defaultMessage="View this timezone on time.is"
      >
        {title => (
          <a
            href={`https://time.is/${urlDate}`}
            target="_blank"
            rel="noreferrer noopener"
            title={title}
          >
            {tzString}
          </a>
        )}
      </FormattedMessage>
    </time>
  );
}

const DatetimeTaskResponse = (props) => {
  if (!props.response) {
    return null;
  }

  const response = convertNumbers2English(props.response);
  const values = response.match(/^(\d+-\d+-\d+) (\d+):(\d+) ([+-]?\d+) (.*)$/);

  if (!values) {
    return (
      <FormattedMessage
        id="datetimeTaskResponse.invalidTimestamp"
        defaultMessage="Error: Invalid timestamp"
      />
    );
  }

  const noTime = /notime/.test(response);

  return noTime ? (
    <DateDisplay isoDate={values[1]} />
  ) : (
    <DateTimeDisplay
      isoDate={values[1]}
      hourString={values[2]}
      minuteString={values[3]}
      tzOffsetHours={Number(values[4])}
      tzString={values[5]}
    />
  );
};

export default DatetimeTaskResponse;
