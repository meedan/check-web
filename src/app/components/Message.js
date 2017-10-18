import React, { Component } from 'react';
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
  margin: 0 auto ${gutterMedium};
  padding: ${gutterSmall} ${gutterLarge};
  position: relative;
  text-align: center;

  a {
    color: ${white} !important;
    text-decoration: underline;
  }
`;

class Message extends Component {
  render() {
    const { message, onClick } = this.props;
    if (message) {
      if (typeof message === 'string' || message instanceof String) {
        return (
          <StyledMessage
            style={this.props.style}
            dangerouslySetInnerHTML={{ __html: message }}
            onClick={onClick}
            className={`message ${this.props.className}`}
          />
        );
      }
      return (
        <StyledMessage
          style={this.props.style}
          onClick={onClick}
          className={`message ${this.props.className}`}
        >
          {message}
        </StyledMessage>
      );
    }
    return null;
  }
}

export default Message;
