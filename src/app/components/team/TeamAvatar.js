import React from 'react';
import styled from 'styled-components';
import {
  avatarSize,
  backgroundCover,
  black05,
  borderWidthSmall,
  defaultBorderRadius,
  separationGray,
  white,
} from '../../styles/js/shared';

const StyledAvatarDiv = styled.div`
  border: ${borderWidthSmall} solid ${black05};
  border-radius: ${defaultBorderRadius};
  flex: 0 0 auto;
  ${backgroundCover}
  background-color: ${white};
  width: ${props => (props.size ? props.size : avatarSize)};
  height: ${props => (props.size ? props.size : avatarSize)};
  border-radius: 5px;
  border: 2px solid ${separationGray};
  position: relative;
`;

const TeamAvatar = props => (
  <StyledAvatarDiv {...props} style={{ backgroundImage: `url(${props.team.avatar})` }} />
);

export default TeamAvatar;
