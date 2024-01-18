import React from 'react';
import styled from 'styled-components';

const StyledAvatarDiv = styled.div`
  border: 1px solid var(--grayDisabledBackground);
  border-radius: 2px;
  flex: 0 0 auto;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  background-color: var(--otherWhite);
  width: ${props => (props.size ? props.size : '40px')};
  height: ${props => (props.size ? props.size : '40px')};
  border-radius: 5px;
  border: 2px solid var(--grayBorderMain);
  position: relative;
`;

const TeamAvatar = props => (
  <StyledAvatarDiv {...props} style={{ backgroundImage: `url(${props.team?.avatar})` }} />
);

export default TeamAvatar;
