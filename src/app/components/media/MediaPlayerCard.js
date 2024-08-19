/* eslint-disable jsx-a11y/media-has-caption, react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import AspectRatio from '../layout/AspectRatio';
import MediaControls from '../cds/media-cards/MediaControls.js';
import Alert from '../cds/alerts-and-prompts/Alert';

const useStyles = makeStyles(() => ({
  video: {
    width: '100%',
    height: '100%',
  },
}));

// from https://github.com/cookpete/react-player/blob/a110aaf2f3f4e23a3ba3889fe9e8e7b96b769f59/src/patterns.js#L3
const youtubeRegex = /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})|youtube\.com\/playlist\?list=|youtube\.com\/user\//;

const poster = '/images/audio_placeholder.svg';

const MediaPlayerCard = ({
  contentWarning,
  coverImage,
  currentUserRole,
  filePath,
  isAudio,
  isYoutube,
  projectMedia,
  superAdminMask,
  warningCategory,
  warningCreator,
}) => {
  const classes = useStyles();
  const videoRef = React.useRef();
  const [errorAlert, setErrorAlert] = React.useState(false);

  // const handleVideoError = () => {
  //   setErrorAlert(true);
  // };

  const handleDownloadButtonClick = () => {
    const downloadLink = document.createElement('a');
    downloadLink.href = filePath;
    downloadLink.download = filePath;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <article className="video-media-card" style={{ position: 'relative' }}>
      { errorAlert &&
      <Alert
        banner
        variant="error"
        buttonLabel="Download video"
        onButtonClick={handleDownloadButtonClick}
        title={
          <FormattedMessage
            id="mediaPlayer.errorTitle"
            defaultMessage="A Playback Error Occurred."
            description="Text displayed in an error box on media page when the video cannot be played"
          />
        }
        content={
          <FormattedMessage
            id="mediaPlayer.errorContent"
            defaultMessage="The video cannot be played because of an issue with the video file. Download the file to play locally."
            description="Text displayed in an error box on media page when the video cannot be played"
          />
        }
        onClose={() => setErrorAlert(false)}
      />
      }
      <AspectRatio
        key={contentWarning}
        contentWarning={contentWarning}
        warningCreator={warningCreator}
        warningCategory={warningCategory}
        projectMedia={projectMedia}
        downloadUrl={isYoutube ? null : filePath}
        isVideoFile
        currentUserRole={currentUserRole}
        superAdminMask={superAdminMask}
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
                onError={() => setErrorAlert(true)}
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
  superAdminMask: PropTypes.bool,
};

MediaPlayerCard.defaultProps = {
  contentWarning: false,
  coverImage: '',
  isYoutube: false,
  warningCategory: '',
  warningCreator: '',
  superAdminMask: false,
};

export default MediaPlayerCard;
