import React from 'react';
import styled from 'styled-components';
import FeedRequestedMedia from './FeedRequestedMedia';
import RequestCards from './RequestCards';
import { Column, backgroundMain, separationGray } from '../../styles/js/shared';

const StyledTwoColumnLayout = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;

  .media__column {
    background-color: ${backgroundMain};
  }

  .requests__column {
    border-left: 1px solid ${separationGray};
  }
`;

const FeedClusterPage = () => (
  <div id="feed-cluster-page">
    <StyledTwoColumnLayout>
      <Column className="media__column">
        <FeedRequestedMedia />
      </Column>
      <Column className="requests__column">
        <RequestCards />
      </Column>
    </StyledTwoColumnLayout>
  </div>
);

export default FeedClusterPage;
