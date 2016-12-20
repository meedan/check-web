import React, { Component, PropTypes } from 'react';
import MediaCard from './MediaCard';

class Medias extends Component {
  render() {
    const props = this.props;

    return (
      <div>
        <ul className="medias">
          {props.medias.map((node) => {
            const media = node.node;

            return (
              <li className="medias__item">
                <MediaCard media={media} />
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}

export default Medias;
