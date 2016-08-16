import React, { Component, PropTypes } from 'react';
import FlatButton from 'material-ui/lib/flat-button';
class Tags extends Component {
  render() {

    return (
      <div>
      {this.props.tags.map(function(tag){
        return (
            <FlatButton label={tag}/>
        );


      })
      }

      </div>
    );
  }
}

export default Tags;
