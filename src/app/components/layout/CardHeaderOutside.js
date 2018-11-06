import React from 'react';
import { Row } from '../../styles/js/shared';

const CardHeaderOutside = (props) => {
  const style = {};
  style[`margin-${props.direction.from}`] = 'auto';

  return (
    <Row>
      <h2>{props.title}</h2>
      <div style={style}>{props.actions}</div>
    </Row>
  );
};

export default CardHeaderOutside;
