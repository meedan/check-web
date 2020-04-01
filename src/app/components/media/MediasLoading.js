import React from 'react';
import styled from 'styled-components';
import {
  units,
  ContentColumn,
  FadeIn,
  Shimmer,
  black05,
  borderWidthSmall,
  defaultBorderRadius,
  white,
} from '../../styles/js/shared';

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
  border: ${borderWidthSmall} solid ${black05};
  border-radius: ${defaultBorderRadius};
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

const MediasLoading = props => (
  <StyledLoadingOuter className="medias-loading">
    <StyledLoadingInner>
      {Array.from(Array(props.count || 3).keys()).map(i => (
        <StyledLoadingCard key={i}>
          <StyledShimmer />
          <StyledShimmer />
        </StyledLoadingCard>
      ))}
    </StyledLoadingInner>
  </StyledLoadingOuter>);

export default MediasLoading;
