import React from 'react';
import Linkify from 'react-linkify';
import nl2br from 'react-nl2br';

const ParsedText = props =>
  <Linkify properties={{ target: '_blank', rel: 'noopener noreferrer' }}>{nl2br(props.text)}</Linkify>
;

export default ParsedText;
