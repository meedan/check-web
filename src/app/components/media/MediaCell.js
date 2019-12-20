import React from 'react';
import styled from 'styled-components';
import { units, Offset, Row, StyledHeading } from '../../styles/js/shared';

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-content: flex-start;
`;

const UpperRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const SmallMediaCard = (props) => {
  const { media } = props.data;
  return (
    <Row>
      { media.picture ?
        <Offset>
          <img
            alt=""
            style={{ width: units(10), height: units(10), objectFit: 'cover' }}
            src={media.picture}
          />
        </Offset>
        : null
      }
      <Content withImage={media.picture}>
        <UpperRow>
          <StyledHeading className="media__heading">
            { media.title }
          </StyledHeading>
        </UpperRow>
        <div className="media__description">
          { media.description }
        </div>
      </Content>
    </Row>
  );
};


export default SmallMediaCard;
