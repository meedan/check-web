import React, { Component, PropTypes } from 'react';
import RaisedButton from 'material-ui/lib/raised-button';

class TwitterAccountIconButton extends Component {
   handleTouchTap(e)
   {

   }
     render() {
         return (
           <div>
              <RaisedButton
               label="Twitter"
               secondary={true}
               onTouchTap={this.handleTouchTap}
                />
           </div>

         )
     }
}
export default TwitterAccountIconButton;
