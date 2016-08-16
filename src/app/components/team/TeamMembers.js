import React, { Component, PropTypes } from 'react';
import Avatar from 'material-ui/lib/avatar';
class TeamMembers extends Component {
  render() {
    var users = this.props.users;
    return (
      <div>

        {users.map(function(user){
          return (
            <li>
              <div>
                <Avatar
                src= {user.node.profile_image}
                style={{border: 12}} />
              </div>
            </li>
          );
        })}

      </div>
    );
  }
}

export default TeamMembers;
