/* eslint-disable react/sort-prop-types */
import React from 'react';
import Linkify from 'react-linkify';
import { toArray } from 'react-emoji-render';
import PropTypes from 'prop-types';
import reactStringReplace from 'react-string-replace';
import MediaChip from './cds/buttons-checkboxes-chips/MediaChip';
import styles from './ParsedText.module.css';

const marked = (text, truncateFileUrls, fileUrlName, mediaChips) => {
  let parsedText = text;

  // If a URL ends on a filename, display only the filename, not the full URL

  if (truncateFileUrls) {
    parsedText = reactStringReplace(text, /(https?:\/\/[^ ]+\/[^/.]+\.[^ ]+)/gm, (match, i) => (
      <a className={styles['media-chip-link']} href={match} key={i} rel="noopener noreferrer" target="_blank">
        { mediaChips
          ? <MediaChip label={fileUrlName || match.replace(/.*\//, '')} url={match} />
          : fileUrlName || match.replace(/.*\//, '')
        }
      </a>
    ));
  }

  // Turn Markdown URLs into links (e.g., [Text](https://url))

  parsedText = reactStringReplace(parsedText, /(\[[^\]]+\]\(https?:\/\/[^ ]+\))/gm, (match, i) => {
    const markdown = match.match(/\[(?<text>[^\]]+)\]\((?<url>https?:\/\/[^ ]+)\)/m); // Extract "text" and "url" from Markdown link
    return (
      <a className={styles['markdown-link']} href={markdown.groups.url} key={i} rel="noopener noreferrer" target="_blank">
        {markdown.groups.text}
      </a>
    );
  });

  // Turn other URLs into links

  parsedText = reactStringReplace(parsedText, /(https?:\/\/[^ ]+)/gm, (match, i) => (
    <a className={styles['media-chip-link']} href={match} key={i} rel="noopener noreferrer" target="_blank">
      { mediaChips ? <MediaChip label={match} url={match} /> : match }
    </a>
  ));

  // For now, only WhatsApp formatting rules... extend it if needed in the future,
  // for example, use a proper Markdown library (WhatsApp doesn't follow Markdown properly)

  parsedText = reactStringReplace(parsedText, /\*([^ ][^*]*[^ ])\*/gm, (match, i) => (
    <strong key={i}>{match}</strong>
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
  // if task type is URL we have an array of object
  const taskAnswer = props.text[0]?.url ? props.text[0].url : props.text;
  const text = taskAnswer.replace(/\\u(\w\w\w\w)/g, (a, b) => {
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
        <span className={styles.StyledEmojiOnly} key={`${k1}${k2}`}>{element}</span>))
    :
    emojified;

  // Add the line breaks elements.
  const breakified = e2.map((line, key) => {
    const parsedLine = line.map(part => (typeof part === 'string' ? marked(part, props.truncateFileUrls, props.fileUrlName, props.mediaChips) : part));
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
    <span className={styles.styledLinkified}><Linkify properties={{ target: '_blank', rel: 'noopener noreferrer' }}>{breakified}</Linkify></span>;

  // Block or not.
  return props.block ? <div>{linkified}</div> : linkified;
};

ParsedText.propTypes = {
  text: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]),
  block: PropTypes.bool,
  truncateFileUrls: PropTypes.bool,
  fileUrlName: PropTypes.string,
  mediaChips: PropTypes.bool,
};

ParsedText.defaultProps = {
  text: '',
  block: false,
  truncateFileUrls: true,
  fileUrlName: null,
  mediaChips: false,
};

export default ParsedText;
