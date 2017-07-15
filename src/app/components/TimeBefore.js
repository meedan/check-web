import React, { Component, PropTypes } from 'react';
import { injectIntl, intlShape } from 'react-intl';

class TimeBefore extends Component {
  timeElementWrapper(date) {
    date = new Date(date);
    const datetimeLabel = new Date(+date - date.getTimezoneOffset() * 60 * 1000).toISOString().split('.')[0].replace('T', ' ').slice(0, -3);

    return (
      <time title={datetimeLabel}>
        {this.props.intl.formatRelative(date)}
      </time>
    );
  }

  render() {
    return (this.timeElementWrapper(this.props.date));
  }
}

TimeBefore.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(TimeBefore);
