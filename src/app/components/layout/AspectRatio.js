import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import SensitiveContentMenuButton from '../media/SensitiveContentMenuButton.js';
import FullscreenIcon from '../../icons/fullscreen.svg';
import FullscreenExitIcon from '../../icons/fullscreen_exit.svg';
import VisibilityOffIcon from '../../icons/visibility_off.svg';
import DownloadIcon from '../../icons/download.svg';
import styles from './AspectRatio.module.css';

const messages = defineMessages({
  adult: {
    id: 'contentScreen.adult',
    defaultMessage: 'Adult',
    description: 'Content warning type: Adult',
  },
  medical: {
    id: 'contentScreen.medical',
    defaultMessage: 'Medical',
    description: 'Content warning type: Medical',
  },
  violence: {
    id: 'contentScreen.violence',
    defaultMessage: 'Violence',
    description: 'Content warning type: Violence',
  },
});

const AspectRatio = ({
  currentUserRole,
  expandedImage,
  downloadUrl,
  children,
  projectMedia,
  isVideoFile,
  isPenderCard,
  superAdminMask,
  intl,
}) => {
  const contentWarning = projectMedia?.show_warning_cover;
  const warningCreator = projectMedia?.dynamic_annotation_flag?.annotator?.name;
  const [maskContent, setMaskContent] = React.useState(contentWarning);
  const [expandedContent, setExpandedContent] = React.useState(null);
  const [isFullscreenVideo, setIsFullscreenVideo] = React.useState(false);
  const uniqueClassName = projectMedia.id;

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
          theme="black"
          size="default"
          variant="contained"
          onClick={handleOnExpand}
          iconCenter={isFullscreenVideo ? <FullscreenExitIcon /> : <FullscreenIcon />}
        /> : null }
      { downloadUrl ?
        <a href={downloadUrl} download>
          <ButtonMain
            className="int-aspect-ratio__button--download"
            theme="black"
            size="default"
            variant="contained"
            iconCenter={<DownloadIcon />}
          />
        </a> : null }
      { projectMedia ?
        <SensitiveContentMenuButton
          projectMedia={projectMedia}
          currentUserRole={currentUserRole}
        /> : null
      }
    </div>
  );

  let warningType = null;
  if (projectMedia?.dynamic_annotation_flag) {
    // Sort by flag category likelihood and display most likely
    let sortable = [];
    // Put custom flag at beginning of array
    if (projectMedia.dynamic_annotation_flag.data.custom) {
      sortable = sortable.concat([...Object.entries(projectMedia.dynamic_annotation_flag.data.custom)]);
    }
    const filteredFlags = {};
    ['adult', 'medical', 'violence'].forEach((key) => { filteredFlags[key] = projectMedia.dynamic_annotation_flag.data.flags[key]; });
    sortable = sortable.concat([...Object.entries(filteredFlags)]);
    sortable.sort((a, b) => b[1] - a[1]);
    const type = sortable[0];
    [warningType] = type;
  }

  const warningCategory = warningType;
  const skipAspectRatio = !maskContent && !superAdminMask && isPenderCard;

  const ToggleShowHideButton = () => (
    <ButtonMain
      className={styles.toggleShowHideButton}
      onClick={() => setMaskContent(!maskContent)}
      variant={maskContent ? 'outlined' : 'contained'}
      size="default"
      theme={maskContent ? 'white' : 'brand'}
      label={maskContent ? (
        <FormattedMessage
          id="contentScreen.viewContentButton"
          defaultMessage="Temporarily view content"
          description="Button to enable view of sensitive content"
        />
      ) : (
        <FormattedMessage
          id="contentScreen.hideContentButton"
          defaultMessage="Hide content"
          description="Button to disable view of sensitive content"
        />
      )}
    />
  );

  const SensitiveScreen = () => (
    <div
      className={cx(
        styles.sensitiveScreen,
        {
          [styles.contentWarning]: maskContent || superAdminMask,
        })
      }
    >
      <VisibilityOffIcon
        className={cx(
          styles.visibilityIcon,
          {
            [styles.warningIcon]: contentWarning || superAdminMask,
          })
        }
      />
      { superAdminMask ? (
        <FormattedMessage
          tagName="p"
          id="contentScreen.superAdminMaskMessage"
          defaultMessage="Super admin screen is on"
          description="Text to show that admin screen is on"
        />
      ) : null }
      <div style={{ visibility: contentWarning && maskContent && !superAdminMask ? 'visible' : 'hidden' }}>
        { warningCreator !== 'Alegre' ? (
          <FormattedHTMLMessage
            tagName="p"
            id="contentScreen.warning"
            defaultMessage={'<strong>{user_name}</strong> has detected this content as <strong>{warning_category}</strong>'}
            description="Content warning displayed over sensitive content"
            values={{
              user_name: warningCreator,
              warning_category: (
                (messages[warningCategory] && intl.formatMessage(messages[warningCategory])) ||
              warningCategory
              ),
            }}
          />
        ) : (
          <FormattedHTMLMessage
            tagName="p"
            id="contentScreen.warningByAutomationRule"
            defaultMessage="An automation rule has detected this content as sensitive"
            description="Content warning displayed over sensitive content"
          />
        )}
      </div>
      { contentWarning && !superAdminMask ? <ToggleShowHideButton /> : null }
    </div>
  );

  if (skipAspectRatio) {
    return (
      <div style={{ position: 'relative' }}>
        <ButtonsContainer />
        {children}
        <SensitiveScreen />
      </div>
    );
  }

  return (
    <div className={cx(uniqueClassName, styles.aspectRatio)}>
      { expandedContent ?
        <Lightbox
          onCloseRequest={() => setExpandedContent(null)}
          mainSrc={expandedContent}
          reactModalStyle={{ overlay: { zIndex: 2000 } }}
        />
        : null }
      <div className={styles.innerWrapper}>
        { !superAdminMask ? <ButtonsContainer /> : null }
        { !maskContent && !superAdminMask ? children : null }
        { contentWarning || superAdminMask ? <SensitiveScreen /> : null }
      </div>
    </div>
  );
};

AspectRatio.propTypes = {
  children: PropTypes.node.isRequired,
  downloadUrl: PropTypes.string,
  expandedImage: PropTypes.string,
  isPenderCard: PropTypes.bool,
  isVideoFile: PropTypes.bool,
  superAdminMask: PropTypes.bool,
  currentUserRole: PropTypes.string.isRequired,
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    show_warning_cover: PropTypes.bool.isRequired,
    dynamic_annotation_flag: PropTypes.object.isRequired,
  }).isRequired,
  intl: intlShape.isRequired,
};

AspectRatio.defaultProps = {
  downloadUrl: '',
  expandedImage: '',
  isPenderCard: false,
  isVideoFile: false,
  superAdminMask: false,
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
