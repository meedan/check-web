import React from 'react';
import Box from '@material-ui/core/Box';

const FaceSmile = (props) => (
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
      <path d="M11,0h-10c-0.552,0 -1,0.448 -1,1c0,2.617 2.86,5 6,5c3.14,0 6,-2.383 6,-5c0,-0.552 -0.448,-1 -1,-1Zm-5,4c-1.636,0 -3.094,-0.951 -3.701,-2h7.411c-0.591,1.052 -2.026,2 -3.71,2Z" transform="translate(6, 13)" />
      <path d="M10,0c-5.514,0 -10,4.486 -10,10c0,5.515 4.486,10 10,10c5.514,0 10,-4.485 10,-10c0,-5.514 -4.486,-10 -10,-10Zm0,18c-4.411,0 -8,-3.589 -8,-8c0,-4.411 3.589,-8 8,-8c4.411,0 8,3.589 8,8c0,4.411 -3.589,8 -8,8Z" transform="translate(2, 2)" />
      <use transform="translate(8, 7)" xlinkHref="#path-1" />
      <use transform="translate(14, 7)" xlinkHref="#path-1" />
    </g>
  </Box>
);

export default FaceSmile;
