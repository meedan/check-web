import React from 'react';
import styled from 'styled-components';
import {
  white,
  black54,
  gutterSmall,
  gutterMedium,
  gutterLarge,
  borderRadiusDefault,
  FadeIn,
} from '../styles/js/shared';

const StyledMessage = styled(FadeIn)`
  background: ${black54};
  border-radius: ${borderRadiusDefault};
  color: ${white};
  margin: ${gutterMedium} auto;
  padding: ${gutterSmall} ${gutterLarge};
  position: relative;
  text-align: center;

  a {
    color: ${white} !important;
    text-decoration: underline;
  }
`;

const Message = (props) => {
  const { message, onClick } = props;
  if (message) {
    if (typeof message === 'string' || message instanceof String) {
      return (
        <StyledMessage
          style={props.style}
          dangerouslySetInnerHTML={{ __html: message }}
          onClick={onClick}
          className={`message ${props.className}`}
        />
      );
    }
    return (
      <StyledMessage
        style={props.style}
        onClick={onClick}
        className={`message ${props.className}`}
      >
        {message}
      </StyledMessage>
    );
  }
  return null;
};

export default Message;
