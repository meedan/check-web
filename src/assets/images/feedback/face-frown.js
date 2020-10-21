import React from "react";
import Box from "@material-ui/core/Box";

const FaceFrown = (props) => (
  <Box
    viewBox="0 0 24 24"
    component="svg"
    display="inline-block"
    height="48px"
    width="48px"
  >
    <defs>
      <path id="path-1" d="M0,0h2v4h-2Z" />
    </defs>
    <path fill="none" d="M0,0h24v24h-24Z" />
    <g fill={props.color}>
      <path
        d="M5.584,0c-2.098,0 -4.082,0.807 -5.584,2.271l1.396,1.433c1.126,-1.098 2.614,-1.704 4.188,-1.704c1.603,0 3.109,0.624 4.242,1.757l1.414,-1.414c-1.511,-1.511 -3.519,-2.343 -5.656,-2.343Z"
        transform="translate(6.467, 13)"
      />
      <path
        d="M10,0c-5.514,0 -10,4.486 -10,10c0,5.515 4.486,10 10,10c5.514,0 10,-4.485 10,-10c0,-5.514 -4.486,-10 -10,-10Zm0,18c-4.411,0 -8,-3.589 -8,-8c0,-4.411 3.589,-8 8,-8c4.411,0 8,3.589 8,8c0,4.411 -3.589,8 -8,8Z"
        transform="translate(2, 2)"
      />
      <use transform="translate(8, 8)" xlinkHref="#path-1" />
      <use transform="translate(14, 8)" xlinkHref="#path-1" />
    </g>
  </Box>
);

export default FaceFrown;
