import React from 'react';
import MediaDetail from './MediaDetail';
import { units } from '../../styles/js/shared';

const Medias = props => (
  <div>
    <ul className="medias">
      {props.medias.map(node => (
        <li key={node.node.dbid} style={{ marginBottom: units(1) }}>
          <MediaDetail media={node.node} condensed />
        </li>))}
    </ul>
  </div>);

export default Medias;
