var React = require('react')
import RaisedButton from 'material-ui/lib/raised-button';

 var TwitterAccountIconButton = React.createClass({
   handleTouchTap: function(e)
   {

   },
     render: function() {
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
})

module.exports = TwitterAccountIconButton;
