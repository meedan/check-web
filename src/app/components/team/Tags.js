import React, { Component, PropTypes } from 'react';
import FlatButton from 'material-ui/FlatButton';

class Tags extends Component {
  render() {
    return (
      <div>
        {this.props.tags.map(tag => (
          <FlatButton label={tag} />
        ))
      }

      </div>
    );
  }
}

export default Tags;
