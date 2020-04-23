import React from 'react';
import Linkify from 'react-linkify';
import { toArray } from 'react-emoji-render';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import ReactHtmlParser from 'react-html-parser';
import ReactDOMServer from 'react-dom/server';
import { units } from '../styles/js/shared';

const StyledEmojiOnly = styled.span`
  line-height: ${units(4)};
  font-size: ${units(4)};
`;

const marked = (text) => {
  const parsedText = text
    .replace(/\*([^*]*)\*/gm, '<b>$1</b>')
    .replace(/_([^_]*)_/gm, '<em>$1</em>')
    .replace(/```([^`]*)```/gm, '<code>$1</code>')
    .replace(/~([^~]*)~/gm, '<strike>$1</strike>');
  return ReactHtmlParser(parsedText);
};

const ParsedText = (props) => {
  if (!props.text) {
    return null;
  }

  // Break into lines.
  const lines = props.text.split('\n');

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
  const breakified = e2.map((line, key) => (
    // eslint-disable-next-line react/no-array-index-key
    <React.Fragment key={key}>
      {line}
      {key < e2.length - 1 ? <br /> : null}
    </React.Fragment>
  ));

  // Convert back to string.
  const string = ReactDOMServer.renderToString(breakified);

  // Markdown.
  const markdown = marked(string);

  // Linkify the result.
  const linkified =
    <Linkify properties={{ target: '_blank', rel: 'noopener noreferrer' }}>{markdown}</Linkify>;

  // Block or not.
  return props.block ? <div>{linkified}</div> : linkified;
};

ParsedText.propTypes = {
  text: PropTypes.string,
  block: PropTypes.bool,
};

ParsedText.defaultProps = {
  text: '',
  block: false,
};

export default ParsedText;
