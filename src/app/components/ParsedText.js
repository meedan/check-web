import React, { Component, PropTypes } from 'react';
import Linkify from 'react-linkify';
import nl2br from 'react-nl2br';

class ParsedText extends Component {
  render() {
    const { text } = this.props;

    return (<Linkify properties={{ target: '_blank', rel: 'noopener noreferrer'}}>{nl2br(text)}</Linkify>);
  }
}

export default ParsedText;
