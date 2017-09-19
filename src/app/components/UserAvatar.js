import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import styled from 'styled-components';
import { avatarStyle, headerAvatarSize } from '../styles/js/shared';

const StyledAvatar = styled(Avatar)`
  ${avatarStyle};
`;

class UserAvatar extends Component {
  render() {
    const me = this.props.me;
    if (me) {
      return (
        <StyledAvatar src={me.profile_image} size={headerAvatarSize} className="avatar" />
      );
    }
    return null;
  }
}

export default UserAvatar;
