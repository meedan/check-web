import React from 'react';
import styled from 'styled-components';

const StyledSvg = styled.svg`
  width: 1em;
  height: 1em;
  display: inline-block;
  font-size: 24;
  fill: currentColor;
`;

const Layer = () => (
  <StyledSvg
    focusable="false"
    viewBox="0 0 24 24"
    aria-hidden="true"
    role="presentation"
  >
    <path
      d="m 12,21.10561 7.36,-5.73 L 21,14.105599 12,7.1055532 3,14.105599 4.63,15.37561 Z"
    />
  </StyledSvg>
);

export default Layer;
