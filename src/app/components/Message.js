import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  gutterSmall,
  gutterMedium,
  gutterLarge,
  defaultBorderRadius,
  FadeIn,
} from '../styles/js/shared';

const StyledMessage = styled(FadeIn)`
  background: var(--textSecondary);
  border-radius: ${defaultBorderRadius};
  color: var(--otherWhite);
  margin: ${gutterMedium} auto;
  padding: ${gutterSmall} ${gutterLarge};
  position: relative;
  text-align: center;

  a {
    color: var(--otherWhite) !important;
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

Message.propTypes = {
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onClick: PropTypes.func,
};

Message.defaultProps = {
  message: '',
  onClick: null,
};

export default Message;
