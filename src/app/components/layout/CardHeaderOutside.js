import React from 'react';
import styled from 'styled-components';
import { Row } from '../../styles/js/shared';

const CardHeaderOutside = (props) => {
  const AlignOpposite = styled.div`
    margin-${props.direction.from}: auto;
  `;

  return (
    <Row>
      <h2>{props.title}</h2>
      <AlignOpposite>{props.actions}</AlignOpposite>
    </Row>
  );
};

export default CardHeaderOutside;
