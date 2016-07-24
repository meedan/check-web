import React, { Component, PropTypes } from 'react';
import RaisedButton from 'material-ui/lib/raised-button';

class FacebookAccountIconButton extends Component {

     render(){
         return (
           <div>
              <RaisedButton
               label="Facebook"
               secondary={true}
               onTouchTap={this.handleTouchTap}
                />
           </div>

         )
     }
}

export default FacebookAccountIconButton;
