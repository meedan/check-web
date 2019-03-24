import React from 'react';
import { injectIntl, intlShape } from 'react-intl';

const TimeBefore = (props) => {
  const date = new Date(props.date);
  const datetimeLabel = new Date(+date - (date.getTimezoneOffset() * 60 * 1000)).toISOString().split('.')[0].replace('T', ' ').slice(0, -3);
  const title = props.titlePrefix ? `${props.titlePrefix} ${datetimeLabel}` : datetimeLabel;

  return (
    <time style={props.style} title={title}>
      {props.intl.formatRelative(date)}
    </time>
  );
};

TimeBefore.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

export default injectIntl(TimeBefore);
