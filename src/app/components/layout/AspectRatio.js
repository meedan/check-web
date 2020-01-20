import React from 'react';
import styled from 'styled-components';
import { black16 } from '../../styles/js/shared.js';

const AspectRatioComponent = (props) => {
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

  return (
    <Container>
      <InnerWrapper>
        {props.children}
      </InnerWrapper>
    </Container>
  );
};

export default AspectRatioComponent;
