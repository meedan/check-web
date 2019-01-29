import React from 'react';

const SVGViewport = props => (
  <svg
    id="svg8"
    version="1.1"
    height="500"
    width="500"
  >
    <defs id="defs2" />
    <g id="layer1">
      <rect
        style={{ fill: 'none', stroke: '#000000', strokeWidth: '0.2436776' }}
        y="0"
        x="0"
        height="500"
        width="500"
        id="frame"
      />
      <image
        id="image"
        y="70"
        x="0"
        height="250"
        width="500"
        href={props.params.image}
      />
      <text
        id="headline"
        y="38"
        x="250"
        textAnchor="middle"
        alignmentBaseline="middle"
        style={{
          fontStyle: 'normal',
          fontWeight: 'normal',
          fontSize: '30px',
          lineHeight: 1.25,
          fontFamily: 'sans-serif',
          letterSpacing: '0px',
          wordSpacing: '0px',
          fill: '#000000',
          fillOpacity: 1,
          stroke: 'none',
          strokeWidth: 0.26458332,
        }}
      >
        {props.params.headline}
      </text>
      <rect
        y="70"
        x="0"
        height="250"
        width="500"
        id="overlay"
        style={{ fill: props.params.overlayColor, fillOpacity: 0.5 }}
      />
      <text
        id="statusText"
        y="300"
        x="480"
        width="500"
        textAnchor="end"
        alignmentBaseline="bottom"
        style={{
          fontStyle: 'normal',
          fontWeight: 'bold',
          fontSize: '50px',
          lineHeight: 1.25,
          fontFamily: 'sans-serif',
          letterSpacing: '2px',
          fill: props.params.statusColor,
          fillOpacity: 1,
          stroke: '#ffffff',
          strokeWidth: 1.25,
        }}
      >
        {props.params.statusText}
      </text>
      <foreignObject x="20" y="340" width="460">
        <div style={{ color: '#000000' }} xmlns="http://www.w3.org/1999/xhtml">
          {props.params.description}
        </div>
      </foreignObject>
      <image
        id="image"
        x="20"
        y="440"
        height="40"
        width="40"
        alignmentBaseline="bottom"
        href={props.params.teamAvatar}
      />
      <text x="70" y="455" id="teamName">{props.params.teamName}</text>
      <text x="70" y="473" id="teamName">{props.params.teamUrl}</text>
    </g>
  </svg>
);

export default SVGViewport;
