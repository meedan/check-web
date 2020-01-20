import React from 'react';
import styled from 'styled-components';
import { units, Offset, Row, StyledHeading } from '../../styles/js/shared';

const Content = styled.div`
  width: ${props => props.withImage ? 'calc(100% - 80px)' : '100%'};
  height: ${units(12)};
  padding: ${units(1)} 0;
  display: flex;
  flex-direction: column;
  align-content: flex-start;
  .media__heading {
    white-space: normal;
    line-height: ${units(2.5)};
    min-height: ${units(5)};
    max-height: ${units(5)};
    overflow: hidden;
  }
  .media__description {
    white-space: normal;
    line-height: ${units(2.5)};
    min-height: ${units(5)};
    max-height: ${units(5)};
    overflow: hidden;
  }
`;

const MediaCell = (props) => {
  const { media } = props.data;
  return (
    <Row className="media-cell">
      { media.picture ?
        <Offset>
          <div
            className="media-cell__thumbnail"
            style={{ width: units(10), height: units(10), overflow: 'hidden' }}
          >
            <img
              alt=""
              style={{ height: '100%', objectFit: 'cover' }}
              src={media.picture}
            />
          </div>
        </Offset>
        : null
      }
      <Content withImage={media.picture} className="media-cell__content">
        <StyledHeading className="media__heading">
          { media.title }
        </StyledHeading>
        { media.description ?
          <div className="media__description">
            { media.description }
          </div> : null
        }
      </Content>
    </Row>
  );
};


export default MediaCell;
