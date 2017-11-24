import React, { Component, PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

class Sentence extends Component {
  render() {
    const { list } = this.props;

    const lastIndex = list.length - 1;

    if (lastIndex === -1) {
      return null;
    }

    if (lastIndex === 0) {
      return <span>{list[0]}</span>;
    }

    const separator = <FormattedMessage id="sentence.separator" defaultMessage="," />;
    const lastSeparator = <FormattedMessage id="sentence.lastSeparator" defaultMessage="and" />;

    return (
      <span>
        {list.map((element, index) => {
          if (index === lastIndex) {
            return <span>{lastSeparator} {element}</span>;
          }
          if (index === lastIndex - 1) {
            return <span>{element} </span>;
          }
          return <span>{element}{separator} </span>;
        })}
      </span>
    );
  }
}

export default Sentence;
