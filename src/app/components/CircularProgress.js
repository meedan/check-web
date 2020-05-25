import React from 'react';
import PropTypes from 'prop-types';
import styled, { keyframes } from 'styled-components';
import { black16, units } from '../styles/js/shared';

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

const StyledBox = styled.div`
  margin: ${units(1)} auto;
  height: 100px;
  width: 100px;
  overflow: hidden;
`;

const StyledSvg = styled.svg`
  display: block;
  animation: ${rotationBuilder} 2s linear infinite;
  height: 100px;
  width: 100px;
`;

const StyledCircle = styled.circle`
  stroke-dasharray: 1,200;
  stroke-dashoffset: 0;
  animation: ${dashBuilder} 1.5s ease-in-out infinite;
  stroke-linecap: round;
`;

const CircularProgress = ({ color }) => (
  <StyledBox>
    <StyledSvg>
      <StyledCircle
        color={color}
        className="path"
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke={color}
        strokeWidth="3"
        stroke-miterlimit="10"
      />
    </StyledSvg>
  </StyledBox>
);
CircularProgress.defaultProps = {
  color: black16,
};
CircularProgress.propTypes = {
  color: PropTypes.string, // or null
};

export default CircularProgress;
