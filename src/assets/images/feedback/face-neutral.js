import React from 'react';
import Box from '@material-ui/core/Box';

const FaceNeutral = (props) => (
  <Box
    component='svg'
    display='inline-block'
    height='48px'
    width='48px'
    viewBox='0 0 24 24'
  >
    <defs>
      <path id="path-1" d="M0,0h2v4h-2Z" />
    </defs>
    <path fill="none" d="M0,0h24v24h-24Z" />
    <g fill={props.color}>
      <path d="M10,0c-5.514,0 -10,4.486 -10,10c0,5.515 4.486,10 10,10c5.514,0 10,-4.485 10,-10c0,-5.514 -4.486,-10 -10,-10Zm0,18c-4.411,0 -8,-3.589 -8,-8c0,-4.411 3.589,-8 8,-8c4.411,0 8,3.589 8,8c0,4.411 -3.589,8 -8,8Z" transform="translate(2, 2)" />
      <path d="M0,0h8v2h-8Z" transform="translate(8, 15)" />
      <use transform="translate(8, 8)" xlinkHref="#path-1" />
      <use transform="translate(14, 8)" xlinkHref="#path-1" />
    </g>
  </Box>
);

export default FaceNeutral;
