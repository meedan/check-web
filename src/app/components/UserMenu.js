import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import MenuItem from 'material-ui/MenuItem';

class UserMenu extends Component {
  render() {
    const me = this.props.me;
    if (me) {
      return (
        <MenuItem
          className="current-user provider-{{me.provider}}"
          leftIcon={<Avatar src={me.profile_image} size={32} className="avatar" />}
        >
          <FlatButton
            id="user-name"
            label={me.name}
            disabled
            style={{ color: 'rgba(0, 0, 0, 0.870588)' }}
          />
        </MenuItem>
      );
    }
    return null;
  }
}

export default UserMenu;
