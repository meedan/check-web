import React, { Component, PropTypes } from 'react';

class UserMenu extends Component {
  render() {
    var me = this.props.me;
    if (me) {
      return (<div className="current-user provider-{{me.provider}}">
                <img src={me.profile_image} alt={me.name} />
                <span dangerouslySetInnerHTML={{__html: me.name}}></span>
              </div>);
    }
    else {
      return null;
    }
  }
}

export default UserMenu;
