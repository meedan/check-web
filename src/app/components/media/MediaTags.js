import React, { Component, PropTypes } from 'react';

class MediaTags extends Component {
  render() {
    console.log(this.props.tags);
    return (
      <ul className='media-tags'>
        {this.props.tags.map((tag) => {
          return (<li className='media-tags__tag'>#{tag.node.tag}</li>);
        })}
      </ul>
    );
  }
}

export default MediaTags;
