import React from 'react';
import styled from 'styled-components';
import { units, Offset, Row, StyledHeading } from '../../styles/js/shared';

const Content = styled.div`
  height: ${units(12)};
  display: flex;
  flex-direction: column;
  align-content: flex-start;
  .media__heading {
    line-height: ${units(6)};
  }
  .media__description {
    line-height: ${units(3)};
  }
`;

const UpperRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
`;

const MediaCell = (props) => {
  const { media } = props.data;
  return (
    <Row className="media-cell">
      { media.picture ?
        <Offset>
          <div style={{ width: units(10), height: units(10), overflow: 'hidden' }}>
            <img
              alt=""
              style={{ height: '100%', objectFit: 'cover' }}
              src={media.picture}
            />
          </div>
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


export default MediaCell;
