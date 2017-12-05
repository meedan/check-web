import React from 'react';
import MediaDetail from './MediaDetail';
import { units } from '../../styles/js/shared';

const Medias = props =>
  <div>
    <ul className="medias">
      {props.medias.map((node) => {
        const media = node.node;

        return (
          <li key={media.dbid} style={{ marginBottom: units(1) }}>
            <MediaDetail media={media} condensed />
          </li>
        );
      })}
    </ul>
  </div>;

export default Medias;
