/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import { FormattedMessage } from 'react-intl';

/**
 * TODO upgrade react-intl v4, and use <FormattedList> instead.
 *
 * https://mantis.meedan.com/view.php?id=8347
 */
// Turning off the following eslint rule because the input is an array of strings.
/* eslint react/no-array-index-key: 0 */
const Sentence = (props) => {
  const lastIndex = props.list.length - 1;
  if (lastIndex === -1) {
    return null;
  }
  if (lastIndex === 0) {
    return <span>{props.list[0]}</span>;
  }

  const separator = <FormattedMessage id="sentence.separator" defaultMessage="," />;
  const lastSeparator = <FormattedMessage id="sentence.lastSeparator" defaultMessage="and" />;

  return (
    <span>
      {props.list.map((element, index) => {
        if (index === lastIndex) {
          return <span key={index}>{lastSeparator} {element}</span>;
        }
        if (index === lastIndex - 1) {
          return <span key={index}>{element} </span>;
        }
        return <span key={index}>{element}{separator} </span>;
      })}
    </span>
  );
};

export default Sentence;
