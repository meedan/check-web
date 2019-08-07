import React from 'react';
import styled from 'styled-components';
import {
  avatarSize,
  avatarStyle,
} from '../../styles/js/shared';

const StyledAvatarDiv = styled.div`
  ${avatarStyle}
  width: ${props => (props.size ? props.size : avatarSize)};
  height: ${props => (props.size ? props.size : avatarSize)};
  position: relative;
`;

const TeamAvatar = (props) => {
  const { style, ...other } = props;

  return (
    <StyledAvatarDiv {...other} style={style || { backgroundImage: `url(${props.team.avatar})` }} />
  );
};

export default TeamAvatar;
