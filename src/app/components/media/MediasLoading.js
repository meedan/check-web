import React, { Component } from 'react';
import styled from 'styled-components';
import ContentColumn from '../layout/ContentColumn';
import { units, FadeIn, Shimmer, black05, defaultBorderWidth, borderRadiusDefault, white } from '../../styles/js/variables';

const gridUnit = units(1.5);

const StyledLoadingOuter = styled(FadeIn)`
  display: flex;
  flex: 1;
  flex-direction: column;
  height: 100%;
  width: 100%;
  margin-top: ${units(2)};
`;

const StyledLoadingInner = styled(ContentColumn)`
  flex-grow: 1;
  width: 100%;
`;

const StyledLoadingCard = styled.div`
  background: ${white};
  border: ${defaultBorderWidth} solid ${black05};
  border-radius: ${borderRadiusDefault};
  margin: ${gridUnit} 0;
  min-height: ${units(11)};
  padding: ${gridUnit};
  position: relative;

  &:first-child {
    margin-top: 0;
  }
`;

const StyledShimmer = styled(Shimmer)`
  border-radius: ${gridUnit};
  height: ${gridUnit};

  &:nth-of-type(1) {
    margin-top: ${gridUnit};
    width: 30%;
  }

  &:nth-of-type(2) {
    margin-top: ${gridUnit};
    width: 90%;
  }
`;

class MediasLoading extends Component {
  render() {
    const count = this.props.count || 3;
    const medias = [];

    for (let i = 0; i < count; i += 1) {
      medias.push(
        <StyledLoadingCard key={i}>
          <StyledShimmer />
          <StyledShimmer />
        </StyledLoadingCard>,
      );
    }

    return (
      <StyledLoadingOuter className="medias-loading">
        <StyledLoadingInner>
          {medias}
        </StyledLoadingInner>
      </StyledLoadingOuter>
    );
  }
}

export default MediasLoading;
