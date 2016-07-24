import React, { Component, PropTypes } from 'react';
import {List, ListItem} from 'material-ui/lib/lists';
import {pinkA200, transparent} from 'material-ui/lib/styles/colors';
import AnnotationsListCellView from './AnnotationsListCellView'
 
class AnnotationsListView extends Component {


  render() {
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
