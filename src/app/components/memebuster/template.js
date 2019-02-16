const template = `
<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" id="svg-template" version="1.1" viewBox="0 0 500 500" height="500" width="500">
  <defs>
    <filter id="whiteOutlineEffect">
      <feMorphology in="SourceAlpha" result="MORPH" operator="dilate" radius="2" />
      <feColorMatrix in="MORPH" result="WHITENED" type="matrix" values="-1 0 0 1 0, 0 -1 0 1 0, 0 0 -1 1 0, 0 0 0 1 0"/>
      <feMerge>
        <feMergeNode in="WHITENED"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect xmlns="http://www.w3.org/2000/svg" style="fill:none;stroke:#000000;stroke-width:0.2436776" y="0" x="0" height="500" width="500" id="frame"/>
  <text id="headline" y="38" x="250" text-anchor="middle" dominant-baseline="middle" style="font-style: normal; font-weight: normal; font-size: 30px; font-family: arial; fill: '#000000'; fill-opacity: 1;">
    HEADLINE
  </text>
  <image id="image" y="70" x="0" height="250" width="500" />
  <rect xmlns="http://www.w3.org/2000/svg" y="70" x="0" height="250" width="500" id="overlay" style="fill: rgb(154, 255, 142); fill-opacity: 0.5;"/>
  <text id="statusText" y="300" x="480" width="500" text-anchor="end" alignment-baseline="bottom" filter="url(#whiteOutlineEffect)" style="font-size: 50px; font-family: arial; fill: rgb(154, 255, 142); fill-opacity: 1;">
    STATUS
  </text>
  <foreignObject x="20" y="330" width="460" height="100">
    <div id="description" xmlns="http://www.w3.org/1999/xhtml" style="color: #000000; font-family: arial; font-size: 14px;">
      Description
    </div>
  </foreignObject>
  <image id="teamAvatar" x="20" y="440" height="40" width="40" alignment-baseline="bottom" />
  <text x="70" y="455" id="teamName" style="font-family: arial;">Team</text>
  <text x="70" y="473" id="teamUrl" style="font-family: arial;">Team Url</text>
</svg>
`;

export default template;
