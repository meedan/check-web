var React = require('react')
import RaisedButton from 'material-ui/lib/raised-button';

 var FacebookAccountIconButton = React.createClass({

     render: function() {
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
})

module.exports = FacebookAccountIconButton;
