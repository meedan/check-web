/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AspectRatio from '../layout/AspectRatio';

const useStyles = makeStyles(() => ({
  video: {
    width: '100%',
    height: '100%',
  },
}));

// from https://github.com/cookpete/react-player/blob/a110aaf2f3f4e23a3ba3889fe9e8e7b96b769f59/src/patterns.js#L3
const youtubeRegex = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})|youtube\.com\/playlist\?list=|youtube\.com\/user\//;

const MediaPlayerCard = ({
  contentWarning,
  coverImage,
  filePath,
  isYoutube,
  projectMedia,
  warningCategory,
  warningCreator,
}) => {
  const classes = useStyles();
  const videoRef = React.useRef();

  return (
    <article className="video-media-card" style={{ position: 'relative' }}>
      <AspectRatio
        key={contentWarning}
        contentWarning={contentWarning}
        warningCreator={warningCreator}
        warningCategory={warningCategory}
        projectMedia={projectMedia}
      >
        { coverImage ? (
          <img
            src={coverImage}
            alt=""
          />
        ) : null }
        <div className="aspect-ratio__overlay">
          { isYoutube ? (
            <iframe
              id="ytplayer"
              title="ytplayer"
              type="text/html"
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${filePath.match(youtubeRegex)[1]}?autoplay=1`}
              frameBorder="0"
            />
          ) : (
            <video
              id="media-player-card__video"
              ref={videoRef}
              src={filePath}
              className={classes.video}
              controls
            />
          )}
        </div>
      </AspectRatio>
    </article>
  );
};

MediaPlayerCard.propTypes = {
  contentWarning: PropTypes.bool,
  coverImage: PropTypes.string,
  filePath: PropTypes.string.isRequired,
  isYoutube: PropTypes.bool,
  warningCategory: PropTypes.string,
  warningCreator: PropTypes.string,
};

MediaPlayerCard.defaultProps = {
  contentWarning: false,
  coverImage: '',
  isYoutube: false,
  warningCategory: '',
  warningCreator: '',
};

export default MediaPlayerCard;
