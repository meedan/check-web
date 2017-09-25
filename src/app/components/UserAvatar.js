import React, { Component } from 'react';
import Avatar from 'material-ui/Avatar';
import styled from 'styled-components';
import { stripUnit } from 'polished';
import { avatarStyle, avatarSize } from '../styles/js/shared';

const StyledAvatar = styled(Avatar)`
  ${avatarStyle};
`;

class UserAvatar extends Component {
  render() {
    const { size, user } = this.props;

    if (user) {
      return (
        <StyledAvatar
          src={user.source.image}
          size={size ? stripUnit(size) : stripUnit(avatarSize)}
          className="avatar"
        />
      );
    }
    return null;
  }
}

export default UserAvatar;
