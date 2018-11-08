import React from 'react';
import { Row } from '../../styles/js/shared';

const CardHeaderOutside = (props) => {
  const style = {
    marginLeft: props.direction.from === 'left' ? 'auto' : undefined,
    marginRight: props.direction.from === 'right' ? 'auto' : undefined,
  };

  return (
    <Row>
      <h2>{props.title}</h2>
      <div style={style}>{props.actions}</div>
    </Row>
  );
};

export default CardHeaderOutside;
