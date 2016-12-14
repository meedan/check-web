import React, { Component, PropTypes } from 'react';
import FlatButton from 'material-ui/FlatButton';
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
