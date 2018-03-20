import React from 'react';
import styled from 'styled-components';
import {
  avatarSize,
  avatarStyle,
  proBadgeStyle,
} from '../../styles/js/shared';

const StyledAvatarDiv = styled.div`
  ${avatarStyle}
  width: ${props => (props.size ? props.size : avatarSize)};
  height: ${props => (props.size ? props.size : avatarSize)};
  position: relative;
  .team__badge {
    ${proBadgeStyle}
  }
`;

const TeamAvatar = (props) => {
  const { style, ...other } = props;

  return (
    <StyledAvatarDiv {...other} style={style || { backgroundImage: `url(${props.team.avatar})` }}>
      { props.team.plan === 'pro' ? <span className="team__badge">PRO</span> : null}
    </StyledAvatarDiv>
  );
};

export default TeamAvatar;
