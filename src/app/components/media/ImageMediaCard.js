import React from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import IconButton from '@material-ui/core/IconButton';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import AspectRatio from '../layout/AspectRatio';
import { white, black32, units } from '../../styles/js/shared.js';

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
          <IconButton
            onClick={this.handleOpenLightbox}
            style={{
              color: white,
              backgroundColor: black32,
              position: 'absolute',
              right: '0',
              top: '0',
              margin: units(2),
            }}
          >
            <FullscreenIcon style={{ width: units(4), height: units(4) }} />
          </IconButton>
          <img
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
