import React, { Component, PropTypes } from 'react';
import Avatar from 'material-ui/Avatar';
import FontIcon from 'material-ui/FontIcon';
import FlatButton from 'material-ui/FlatButton';
import { Link } from 'react-router';

class UserMenu extends Component {
  render() {
    var me = this.props.me;
    if (me) {
      return (<span className="current-user provider-{{me.provider}}">
                <Avatar src={me.profile_image} size="32" className="avatar" />
                <Link to="/me" id="link-me"><FlatButton id="user-name" label={me.name} /></Link>
              </span>);
    }
    else {
      return null;
    }
  }
}

export default UserMenu;
