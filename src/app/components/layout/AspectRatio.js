import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { black16 } from '../../styles/js/shared.js';

const Container = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 56.25%;
  position: relative;
  background-color: ${black16};
`;

const InnerWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const AspectRatioComponent = ({ children }) => (
  <Container>
    <InnerWrapper>
      {children}
    </InnerWrapper>
  </Container>
);
AspectRatioComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AspectRatioComponent;
