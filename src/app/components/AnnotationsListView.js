import React, { Component, PropTypes } from 'react';
import {List, ListItem} from 'material-ui/lib/lists';
import {pinkA200, transparent} from 'material-ui/lib/styles/colors';
import AnnotationsListCellView from './AnnotationsListCellView'
var  annotations = [{
            content: 'content',
            created_at: 'created_at' ,
            annotation_type: 'annotation_type',
            annotator: {
              name: 'name',
              profile_image: 'profile_image'
            }
          }]
class AnnotationsListView extends Component {


  render() {
    this.props.annotations = annotations
    return (
       <ul>
         {this.props.annotations.map(function(annotation){
           return (
             <li>
               <div>

                 <AnnotationsListCellView annotation = {annotation}/>
               </div>
             </li>
           );
         })}
       </ul>
     );
  }
}

export default AnnotationsListView;
