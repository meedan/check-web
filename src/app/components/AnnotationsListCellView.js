import React, { Component, PropTypes } from 'react';
import {List, ListItem} from 'material-ui/lib/lists';
import {pinkA200, transparent} from 'material-ui/lib/styles/colors';
var  annotation = {
            content: 'content',
            created_at: 'created_at' ,
            annotation_type: 'annotation_type',
            annotator: {
              name: 'name',
              profile_image: 'profile_image'
            }
          }

class AnnotationsListCellView extends Component {



  render() {
    return (
       <div>
       {this.props.annotation.content}
       {this.props.annotation.created_at}
       {this.props.annotation.annotator.name}
       {this.props.annotation.annotator.profile_image}
       </div>
     );
  }
}

export default AnnotationsListCellView;
