import React, { Component, PropTypes } from 'react';
import Avatar from 'material-ui/lib/Avatar';
class UserAvatar extends Component {
     render {
         return (
           <div>
                   <Avatar
                   size={100}
                   src={this.props.url}
                   style={{border: 12}} />           </div>
         )
     }
})
export default UserAvatar;
