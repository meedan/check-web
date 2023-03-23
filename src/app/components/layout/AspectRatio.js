import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedHTMLMessage, injectIntl, defineMessages } from 'react-intl';
import { graphql, createFragmentContainer } from 'react-relay/compat';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import FullscreenExitIcon from '@material-ui/icons/FullscreenExit';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import DownloadIcon from '@material-ui/icons/Download';
import { textPrimary, brandMain, otherWhite } from '../../styles/js/shared.js';
import SensitiveContentMenuButton from '../media/SensitiveContentMenuButton.js';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
    height: 0,
    paddingBottom: '56.25%',
    position: 'relative',
    backgroundColor: textPrimary,
  },
  innerWrapper: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    '& img': {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
    },
    '& div.aspect-ratio__overlay': {
      width: '100%',
      height: '100%',
      position: 'absolute',
      top: 0,
      zIndex: 10,
    },
  },
  buttonsContainer: {
    position: 'absolute',
    right: '0',
    top: '0',
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1),
    zIndex: 20,
  },
  sensitiveScreen: props => ({
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: props.contentWarning ? textPrimary : 'transparent',
    zIndex: 100,
    color: otherWhite,
  }),
  visibilityIcon: props => ({
    fontSize: '40px',
    visibility: props.contentWarning ? 'visible' : 'hidden',
  }),
  iconButton: {
    color: otherWhite,
    backgroundColor: textPrimary,
    margin: theme.spacing(0.5),
    '&:hover': {
      color: `${otherWhite} !important`,
      backgroundColor: `${textPrimary} !important`,
    },
  },
  button: props => ({
    pointerEvents: 'auto',
    bottom: 0,
    color: otherWhite,
    minWidth: theme.spacing(22),
    backgroundColor: props.contentWarning ? textPrimary : brandMain,
    border: `2px solid ${otherWhite}`,
    '& :hover': {
      backgroundColor: 'unset',
    },
  }),
}));

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
  intl,
}) => {
  const contentWarning = projectMedia?.show_warning_cover;
  const warningCreator = projectMedia?.dynamic_annotation_flag?.annotator?.name;

  const [maskContent, setMaskContent] = React.useState(contentWarning);
  const [expandedContent, setExpandedContent] = React.useState(null);
  const [isFullscreenVideo, setIsFullscreenVideo] = React.useState(false);
  const classes = useStyles({ contentWarning: contentWarning && maskContent });

  const handleOnExpand = () => {
    // If this is video, use the button to enter or exit fullscreen for the container div depending on whether we are already in fullscreen
    if (isVideoFile) {
      if (isFullscreenVideo) {
        document.exitFullscreen();
        setIsFullscreenVideo(false);
      } else {
        document.querySelectorAll('.video-media-card')[0].requestFullscreen();
        setIsFullscreenVideo(true);
      }
    } else {
      setExpandedContent(expandedImage);
    }
  };

  const ButtonsContainer = () => (
    <div className={classes.buttonsContainer}>
      { expandedImage || isVideoFile ?
        <div>
          <IconButton
            classes={{ root: classes.iconButton }}
            onClick={handleOnExpand}
            size="small"
          >
            { isFullscreenVideo ? <FullscreenExitIcon /> : <FullscreenIcon /> }
          </IconButton>
        </div> : null }
      { downloadUrl ?
        <div>
          <a href={downloadUrl} download>
            <IconButton
              classes={{ root: classes.iconButton }}
              size="small"
            >
              <DownloadIcon />
            </IconButton>
          </a>
        </div> : null }
      { projectMedia ?
        <div>
          <SensitiveContentMenuButton
            iconButtonClasses={{ root: classes.iconButton }}
            projectMedia={projectMedia}
            currentUserRole={currentUserRole}
          />
        </div> : null
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

  return (
    <div className={classes.container}>
      { expandedContent ?
        <Lightbox
          onCloseRequest={() => setExpandedContent(null)}
          mainSrc={expandedContent}
          reactModalStyle={{ overlay: { zIndex: 2000 } }}
        />
        : null }
      <div className={classes.innerWrapper}>
        <ButtonsContainer />
        { !maskContent ? children : null }
        { contentWarning ?
          <div className={classes.sensitiveScreen}>
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="space-between"
              height="100%"
              alignItems="center"
              pt={8}
              pb={4}
            >
              <VisibilityOffIcon className={classes.visibilityIcon} />
              <div style={{ visibility: contentWarning && maskContent ? 'visible' : 'hidden' }}>
                <Typography variant="body1">
                  { warningCreator !== 'Alegre' ? (
                    <FormattedHTMLMessage
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
                      id="contentScreen.warningByAutomationRule"
                      defaultMessage="An automation rule has detected this content as sensitive"
                      description="Content warning displayed over sensitive content"
                    />
                  )}
                </Typography>
              </div>
              { contentWarning ? (
                <Button
                  className={classes.button}
                  onClick={() => setMaskContent(!maskContent)}
                  color="primary"
                  variant="contained"
                >
                  { maskContent ? (
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
                </Button>
              ) : null }
            </Box>
          </div> : null
        }
      </div>
    </div>
  );
};

AspectRatio.propTypes = {
  children: PropTypes.node.isRequired,
  downloadUrl: PropTypes.string,
  isVideoFile: PropTypes.bool,
};

AspectRatio.defaultProps = {
  downloadUrl: '',
  isVideoFile: false,
};

export default createFragmentContainer(injectIntl(AspectRatio), graphql`
  fragment AspectRatio_projectMedia on ProjectMedia {
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
