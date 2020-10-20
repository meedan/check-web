import React from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import Box from '@material-ui/core/Box';
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
      <Box clone textAlign="center">
        <article className="image-media-card">
          <AspectRatio>
            <Box clone color={white} bgcolor={black32} position="absolute" right={0} top={0} m={units(2)}>
              <IconButton onClick={this.handleOpenLightbox}>
                <Box clone width={units(4)} height={units(4)}>
                  <FullscreenIcon />
                </Box>
              </IconButton>
            </Box>
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
      </Box>
    );
  }
}

export default ImageMediaCard;
