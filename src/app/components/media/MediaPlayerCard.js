/* eslint-disable jsx-a11y/media-has-caption */
import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import AspectRatio from '../layout/AspectRatio';
import MediaControls from '../cds/media-cards/MediaControls.js';

const useStyles = makeStyles(() => ({
  video: {
    width: '100%',
    height: '100%',
  },
}));

// from https://github.com/cookpete/react-player/blob/a110aaf2f3f4e23a3ba3889fe9e8e7b96b769f59/src/patterns.js#L3
const youtubeRegex = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})|youtube\.com\/playlist\?list=|youtube\.com\/user\//;

const poster = "data:image/svg+xml;charset=UTF-8,%3csvg viewBox='245.959 17 466 466' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M466 0H0V466H466V0Z' fill='%239E9E9E' transform='matrix(1, 0, 0, 1, 245.95903, 17.000002)'/%3e%3cpath d='M197 393.755C305.665 393.755 393.755 305.665 393.755 197C393.755 88.3346 305.665 0.244141 197 0.244141C88.3346 0.244141 0.244141 88.3346 0.244141 197C0.244141 305.665 88.3346 393.755 197 393.755Z' fill='white' fill-opacity='0.05' transform='matrix(1, 0, 0, 1, 281.959473, 53.000427)'/%3e%3cpath d='M144 287.252C223.116 287.252 287.252 223.116 287.252 144C287.252 64.8841 223.116 0.748047 144 0.748047C64.8841 0.748047 0.748047 64.8841 0.748047 144C0.748047 223.116 64.8841 287.252 144 287.252Z' fill='white' fill-opacity='0.1' transform='matrix(1, 0, 0, 1, 334.959015, 105.999969)'/%3e%3cpath d='M92.0004 183.474C142.52 183.474 183.475 142.52 183.475 92C183.475 41.4802 142.52 0.525879 92.0004 0.525879C41.4807 0.525879 0.526367 41.4802 0.526367 92C0.526367 142.52 41.4807 183.474 92.0004 183.474Z' fill='white' fill-opacity='0.2' transform='matrix(1, 0, 0, 1, 386.958344, 158.000061)'/%3e%3cpath d='M55.0005 109.367C85.0263 109.367 109.367 85.0258 109.367 55C109.367 24.9741 85.0263 0.633301 55.0005 0.633301C24.9746 0.633301 0.633789 24.9741 0.633789 55C0.633789 85.0258 24.9746 109.367 55.0005 109.367Z' fill='white' fill-opacity='0.5' transform='matrix(1, 0, 0, 1, 423.958649, 194.999863)'/%3e%3cpath d='M0.875 11.6248V23.3748H8.70833L18.5 33.1664V1.83311L8.70833 11.6248H0.875ZM27.3125 17.4998C27.3125 14.0335 25.315 11.0569 22.4167 9.60769V25.3723C25.315 23.9427 27.3125 20.966 27.3125 17.4998ZM22.4167 0.325195V4.35936C28.0763 6.04353 32.2083 11.2919 32.2083 17.4998C32.2083 23.7077 28.0763 28.956 22.4167 30.6402V34.6744C30.2696 32.8923 36.125 25.8814 36.125 17.4998C36.125 9.11811 30.2696 2.10728 22.4167 0.325195Z' fill='%231F1F1F' transform='matrix(1, 0, 0, 1, 460.459015, 232.500198)'/%3e%3c/svg%3e";

const MediaPlayerCard = ({
  contentWarning,
  coverImage,
  currentUserRole,
  filePath,
  isAudio,
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
        downloadUrl={isYoutube ? null : filePath}
        isVideoFile
        currentUserRole={currentUserRole}
      >
        { coverImage ? (
          <img
            src={coverImage}
            alt=""
            onError={(e) => { e.target.onerror = null; e.target.src = '/images/image_placeholder.svg'; }}
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
            <>
              <video
                id="media-player-card__video"
                ref={videoRef}
                src={filePath}
                className={classes.video}
                poster={isAudio ? poster : ''}
              />
              <MediaControls videoRef={videoRef} />
            </>
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
