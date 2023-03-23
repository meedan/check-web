import React from 'react';
import styled from 'styled-components';
import {
  avatarSize,
  backgroundCover,
  grayDisabledBackground,
  borderWidthSmall,
  defaultBorderRadius,
  grayBorderMain,
  otherWhite,
} from '../../styles/js/shared';

const StyledAvatarDiv = styled.div`
  border: ${borderWidthSmall} solid ${grayDisabledBackground};
  border-radius: ${defaultBorderRadius};
  flex: 0 0 auto;
  ${backgroundCover}
  background-color: ${otherWhite};
  width: ${props => (props.size ? props.size : avatarSize)};
  height: ${props => (props.size ? props.size : avatarSize)};
  border-radius: 5px;
  border: 2px solid ${grayBorderMain};
  position: relative;
`;

const TeamAvatar = props => (
  <StyledAvatarDiv {...props} style={{ backgroundImage: `url(${props.team.avatar})` }} />
);

export default TeamAvatar;
