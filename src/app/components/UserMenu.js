import React, { Component, PropTypes } from 'react';
import Avatar from 'material-ui/lib/avatar';
import FontIcon from 'material-ui/lib/font-icon';
import FlatButton from 'material-ui/lib/flat-button';

class UserMenu extends Component {
  render() {
    var me = this.props.me;
    if (me) {
      return (<span className="current-user provider-{{me.provider}}">
                <Avatar src={me.profile_image} size="32" className="avatar" />
                <FlatButton label={me.name} icon={<FontIcon className="muidocs-icon-custom-github" />} />
              </span>);
    }
    else {
      return null;
    }
  }
}

export default UserMenu;
