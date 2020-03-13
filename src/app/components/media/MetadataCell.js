import React from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import { black87 } from '../../styles/js/shared';

const Content = styled.div`
  width: 100%;
  color: ${black87};
`;

const MetadataCell = (props) => {
  const { url, query } = props.data;

  return (
    <Link to={{ pathname: url, state: { query } }}>
      <Content>
        { props.value }
      </Content>
    </Link>
  );
};


export default MetadataCell;
