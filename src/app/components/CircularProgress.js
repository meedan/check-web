import React from 'react';
import styled, { keyframes } from 'styled-components';
import { black16, units } from '../styles/js/shared';

const CircularProgress = (props) => {
  const defaultStyle = {
    margin: `${units(1)} 0`,
    overflow: 'hidden',
    width: '100%',
    textAlign: 'center',
  };
  const color = props.color || black16;
  const style = Object.assign(defaultStyle, props);

  const rotationBuilder = () => {
    const rotation = keyframes`
      100% {
        transform: rotate(360deg);
      }
    `;
    return rotation;
  };

  const dashBuilder = () => {
    const dash = keyframes`
      0% {
        stroke-dasharray: 1,200;
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dasharray: 89,200;
        stroke-dashoffset: -35;
      }
      100% {
        stroke-dasharray: 89,200;
        stroke-dashoffset: -124;
      }
    `;
    return dash;
  };

  const StyledSvg = styled.svg`
    animation: ${rotationBuilder} 2s linear infinite;
    height: 100px;
    position: relative;
    width: 100px;
  `;

  const StyledCircle = styled.circle`
    stroke-dasharray: 1,200;
    stroke-dashoffset: 0;
    animation: ${dashBuilder} 1.5s ease-in-out infinite;
    stroke-linecap: round;
    stroke: ${color};
    stroke-width: 3 
  `;

  return (
    <div style={style}>
      <StyledSvg className="circular">
        <StyledCircle
          className="path"
          cx="50"
          cy="50"
          r="20"
          fill="none"
          stroke-width="6"
          stroke-miterlimit="10"
        />
      </StyledSvg>
    </div>
  );
};

export default CircularProgress;
