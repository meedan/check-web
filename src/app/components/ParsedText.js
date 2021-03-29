import React from 'react';
import Linkify from 'react-linkify';
import { toArray } from 'react-emoji-render';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import reactStringReplace from 'react-string-replace';
import { units } from '../styles/js/shared';

const StyledEmojiOnly = styled.span`
  line-height: ${units(4)};
  font-size: ${units(4)};
`;

const marked = (text, truncateFileUrls) => {
  let parsedText = text;

  // If a URL ends on a filename, display only the filename, not the full URL

  if (truncateFileUrls) {
    parsedText = reactStringReplace(text, /(https?:\/\/[^ ]+\/[^/.]+\.[^ ]+)/gm, (match, i) => (
      <a href={match} target="_blank" key={i} rel="noopener noreferrer">{match.replace(/.*\//, '')}</a>
    ));
  }

  // Turn other URLs into links

  parsedText = reactStringReplace(parsedText, /(https?:\/\/[^ ]+)/gm, (match, i) => (
    <a href={match} target="_blank" key={i} rel="noopener noreferrer">{match}</a>
  ));

  // For now, only WhatsApp formatting rules... extend it if needed in the future,
  // for example, use a proper Markdown library (WhatsApp doesn't follow Markdown properly)

  parsedText = reactStringReplace(parsedText, /\*([^ ][^*]*[^ ])\*/gm, (match, i) => (
    <b key={i}>{match}</b>
  ));

  parsedText = reactStringReplace(parsedText, /_([^_]*)_/gm, (match, i) => (
    <em key={i}>{match}</em>
  ));

  parsedText = reactStringReplace(parsedText, /~([^~]*)~/gm, (match, i) => (
    <strike key={i}>{match}</strike>
  ));

  parsedText = reactStringReplace(parsedText, /```([^`]*)```/gm, (match, i) => (
    <code key={i}>{match}</code>
  ));
  return parsedText;
};

const ParsedText = (props) => {
  if (!props.text) {
    return null;
  }

  // Convert unicode.
  const text = props.text.replace(/\\u(\w\w\w\w)/g, (a, b) => {
    const charCode = parseInt(b, 16);
    return String.fromCharCode(charCode);
  });

  // Break into lines.
  const lines = text.split('\n');

  // Emojify each text line into array of elements.
  const emojified = lines.map(line =>
    toArray(line, {
      protocol: '',
      baseUrl: '//cdnjs.cloudflare.com/ajax/libs/emojione/2.2.7/assets/png/',
      size: '',
      ext: 'png',
    }));

  // If only emojis (across all lines), make them bigger.
  const e2 = (emojified.every(a => a.every(e => typeof e !== 'string' || e.trim() === ''))) ?
    emojified.map((line, k1) =>
      line.map((element, k2) =>
        // eslint-disable-next-line react/no-array-index-key
        <StyledEmojiOnly key={`${k1}${k2}`}>{element}</StyledEmojiOnly>))
    :
    emojified;

  // Add the line breaks elements.
  const breakified = e2.map((line, key) => {
    const parsedLine = line.map(part => (typeof part === 'string' ? marked(part, props.truncateFileUrls) : part));
    return (
      // eslint-disable-next-line react/no-array-index-key
      <React.Fragment key={key}>
        {parsedLine}
        {key < e2.length - 1 ? <br /> : null}
      </React.Fragment>
    );
  });

  // Linkify the result.
  const linkified =
    <Linkify properties={{ target: '_blank', rel: 'noopener noreferrer' }}>{breakified}</Linkify>;

  // Block or not.
  return props.block ? <div>{linkified}</div> : linkified;
};

ParsedText.propTypes = {
  text: PropTypes.string,
  block: PropTypes.bool,
  truncateFileUrls: PropTypes.bool,
};

ParsedText.defaultProps = {
  text: '',
  block: false,
  truncateFileUrls: true,
};

export default ParsedText;
