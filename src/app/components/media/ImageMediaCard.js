import React from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import AspectRatio from '../layout/AspectRatio';

/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */
class ImageMediaCard extends React.Component {
  state = {
    image: null,
  };

  handleCloseLightbox = () => {
    this.setState({ image: null });
  };

  handleOpenLightbox = () => {
    this.setState({ image: this.props.imagePath });
  }

  render() {
    return (
      <article className="image-media-card" style={{ textAlign: 'center' }}>
        <AspectRatio>
          <img
            onClick={this.handleOpenLightbox}
            src={this.props.imagePath}
            alt=""
          />
        </AspectRatio>
        { this.state.image ?
          <Lightbox
            onCloseRequest={this.handleCloseLightbox}
            mainSrc={this.state.image}
          />
          : null }
      </article>
    );
  }
}

export default ImageMediaCard;
