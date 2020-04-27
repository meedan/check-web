import React from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import { black87 } from '../../styles/js/shared';

const Content = styled.div`
  cursor: ${props => props.optimistic ? 'wait' : 'pointer'};
  width: 100%;
  color: ${black87};
`;

const MetadataCell = (props) => {
  const { url, query } = props.data;

  return url ? (
    <Link to={{ pathname: url, state: { query } }}>
      <Content>
        { props.value }
      </Content>
    </Link>
  ) : (
    <Content optimistic>
      { props.value }
    </Content>
  );
};


export default MetadataCell;
