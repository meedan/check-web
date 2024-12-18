import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import cx from 'classnames/bind';
import ContentWarningMessage from './ContentWarningMessage.js';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import SensitiveContentMenuButton from '../media/SensitiveContentMenuButton.js';
import FullscreenIcon from '../../icons/fullscreen.svg';
import FullscreenExitIcon from '../../icons/fullscreen_exit.svg';
import VisibilityOffIcon from '../../icons/visibility_off.svg';
import DownloadIcon from '../../icons/download.svg';
import styles from './AspectRatio.module.css';

const AspectRatio = ({
  children,
  className,
  currentUserRole,
  downloadUrl,
  expandedImage,
  intl,
  isPenderCard,
  isVideoFile,
  projectMedia,
}) => {
  const contentWarning = projectMedia?.show_warning_cover;
  const warningCreator = projectMedia?.dynamic_annotation_flag?.annotator?.name;
  const [maskContent, setMaskContent] = React.useState(contentWarning);
  const [expandedContent, setExpandedContent] = React.useState(null);
  const [isFullscreenVideo, setIsFullscreenVideo] = React.useState(false);
  const uniqueClassName = projectMedia?.id.replace(/[^a-zA-Z0-9]/g, '');

  const [generalContentMask, setGeneralContentMask] = React.useState(window.localStorage.getItem('contentMask') === 'true');

  useEffect(() => {
    const handleMaskChange = (event) => {
      if (event.key === 'contentMask') {
        setGeneralContentMask(event.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleMaskChange);

    return () => {
      window.removeEventListener('storage', handleMaskChange);
    };
  }, []);

  const handleOnExpand = () => {
    // If this is video, use the button to enter or exit fullscreen for the container div depending on whether we are already in fullscreen
    if (isVideoFile) {
      if (isFullscreenVideo && document?.fullscreen) {
        document.exitFullscreen();
        setIsFullscreenVideo(false);
      } else {
        document.querySelectorAll(`.${uniqueClassName}`)[0].parentElement.requestFullscreen();
        setIsFullscreenVideo(true);
      }
    } else {
      setExpandedContent(expandedImage);
    }
  };

  const ButtonsContainer = () => (
    <div className={styles.buttonsContainer}>
      { expandedImage || isVideoFile ?
        <ButtonMain
          className="int-aspect-ratio__button--fullscreen"
          iconCenter={isFullscreenVideo ? <FullscreenExitIcon /> : <FullscreenIcon />}
          size="default"
          theme="black"
          variant="contained"
          onClick={handleOnExpand}
        /> : null }
      { downloadUrl ?
        <a download href={downloadUrl}>
          <ButtonMain
            className="int-aspect-ratio__button--download"
            iconCenter={<DownloadIcon />}
            size="default"
            theme="black"
            variant="contained"
          />
        </a> : null }
      { projectMedia ?
        <SensitiveContentMenuButton
          currentUserRole={currentUserRole}
          projectMedia={projectMedia}
          onSave={(enabled) => { setMaskContent(enabled); }}
        /> : null
      }
    </div>
  );

  let warningType = null;
  if (projectMedia?.dynamic_annotation_flag) {
    // Sort by flag category likelihood and display most likely
    let sortable = [];
    // Put custom flag at beginning of array
    if (projectMedia?.dynamic_annotation_flag.data.custom) {
      sortable = sortable.concat([...Object.entries(projectMedia.dynamic_annotation_flag.data.custom)]);
    }
    const filteredFlags = {};
    ['adult', 'medical', 'spam', 'violence'].forEach((key) => { filteredFlags[key] = projectMedia.dynamic_annotation_flag.data.flags[key]; });
    sortable = sortable.concat([...Object.entries(filteredFlags)]);
    sortable.sort((a, b) => b[1] - a[1]);
    const type = sortable[0];
    [warningType] = type;
  }

  const warningCategory = warningType;
  const skipAspectRatio = !maskContent && !generalContentMask && isPenderCard;

  const ToggleShowHideButton = () => (
    <ButtonMain
      className={styles.toggleShowHideButton}
      label={maskContent ? (
        <FormattedMessage
          defaultMessage="Temporarily view content"
          description="Button to enable view of sensitive content"
          id="contentScreen.viewContentButton"
        />
      ) : (
        <FormattedMessage
          defaultMessage="Hide content"
          description="Button to disable view of sensitive content"
          id="contentScreen.hideContentButton"
        />
      )}
      size="default"
      theme={maskContent ? 'white' : 'info'}
      variant={maskContent ? 'outlined' : 'contained'}
      onClick={() => setMaskContent(!maskContent)}
    />
  );

  const SensitiveScreen = () => (
    <div
      className={cx(
        styles.sensitiveScreen,
        {
          [styles.contentWarning]: maskContent || generalContentMask,
        })
      }
    >
      <VisibilityOffIcon
        className={cx(
          styles.visibilityIcon,
          {
            [styles.warningIcon]: contentWarning || generalContentMask,
          })
        }
      />
      { generalContentMask ? (
        <FormattedMessage
          defaultMessage="Sensitive Content Masking Applied"
          description="Text to show that admin screen is on"
          id="contentScreen.superAdminMaskMessage"
          tagName="p"
        />
      ) : null }
      {contentWarning && maskContent && !generalContentMask ?
        <ContentWarningMessage
          intl={intl}
          warningCategory={warningCategory}
          warningCreator={warningCreator}
        /> : null
      }
      { contentWarning && !generalContentMask ? <ToggleShowHideButton /> : null }
    </div>
  );

  if (skipAspectRatio) {
    return (
      <div
        className={cx(
          styles.aspectRatioSkipped,
          {
            [className]: true,
          })
        }
      >
        <ButtonsContainer />
        {children}
        <SensitiveScreen />
      </div>
    );
  }

  return (
    <div
      className={cx(
        uniqueClassName,
        styles.aspectRatio,
        {
          [className]: true,
        })
      }
    >
      { expandedContent ?
        <Lightbox
          mainSrc={expandedContent}
          reactModalStyle={{ overlay: { zIndex: 2000 } }}
          onCloseRequest={() => setExpandedContent(null)}
        />
        : null }
      <div className={styles.innerWrapper}>
        { !generalContentMask ? <ButtonsContainer /> : null }
        { !maskContent && !generalContentMask ? children : null }
        { contentWarning || generalContentMask ? <SensitiveScreen /> : null }
      </div>
    </div>
  );
};

AspectRatio.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  currentUserRole: PropTypes.string.isRequired,
  downloadUrl: PropTypes.string,
  expandedImage: PropTypes.string,
  intl: intlShape.isRequired,
  isPenderCard: PropTypes.bool,
  isVideoFile: PropTypes.bool,
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    show_warning_cover: PropTypes.bool.isRequired,
    dynamic_annotation_flag: PropTypes.object.isRequired,
  }),
};

AspectRatio.defaultProps = {
  className: null,
  downloadUrl: '',
  expandedImage: '',
  isPenderCard: false,
  isVideoFile: false,
  projectMedia: null,
};

export default createFragmentContainer(injectIntl(AspectRatio), graphql`
  fragment AspectRatio_projectMedia on ProjectMedia {
    id
    show_warning_cover
    dynamic_annotation_flag {
      data
      annotator {
        name
      }
    }
    ...SensitiveContentMenuButton_projectMedia
  }
`);
