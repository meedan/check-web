var React = require('react')
import Avatar from 'material-ui/lib/Avatar';
 var UserAvatar = React.createClass({

     render: function() {
         return (
           <div>
                   <Avatar
                   size={100}
                   src={this.props.url}
                   style={{border: 12}} />           </div>
         )
     }
})

module.exports = UserAvatar;
