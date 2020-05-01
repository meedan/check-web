import React from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import { black87, units, Offset, Row, StyledHeading } from '../../styles/js/shared';

const Content = styled.div`
  cursor: ${props => props.optimistic ? 'wait' : 'pointer'};
  width: ${props => props.withImage ? 'calc(100% - 80px)' : '100%'};
  height: ${units(12)};
  padding: ${units(1)} 0;
  color: ${black87};
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
  const { media, url, query } = props.data;

  const cell = (
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
      <Content
        className="media-cell__content"
        optimistic={!url}
        withImage={media.picture}
      >
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

  return url ? (
    <Link to={{ pathname: url, state: { query } }}>
      {cell}
    </Link>
  ) : (
    cell
  );
};

export default MediaCell;
