import React from 'react';
import Linkify from 'react-linkify';
import { toArray } from 'react-emoji-render';

const ParsedText = props => (
  <Linkify properties={{ target: '_blank', rel: 'noopener noreferrer' }}>
    {props.text.split('\n').map((item, key) => (
      // eslint-disable-next-line react/no-array-index-key
      <React.Fragment key={key}>
        {toArray(item, {
          protocol: '',
          baseUrl: '//cdnjs.cloudflare.com/ajax/libs/emojione/2.2.7/assets/png/',
          size: '',
          ext: 'png',
        })}
        <br />
      </React.Fragment>
    ))}
  </Linkify>
);

export default ParsedText;
