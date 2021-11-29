import React from 'react';
import { FormattedMessage, FormattedHTMLMessage, injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { opaqueBlack87, black32, checkBlue, opaqueBlack38, units, white } from '../../styles/js/shared.js';

const useStyles = makeStyles(theme => ({
  container: {
    width: '100%',
    height: 0,
    paddingBottom: '56.25%',
    position: 'relative',
    backgroundColor: opaqueBlack38,
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
  sensitiveScreen: props => ({
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: props.contentWarning ? opaqueBlack87 : 'transparent',
    zIndex: 100,
    color: 'white',
  }),
  icon: props => ({
    fontSize: '40px',
    visibility: props.contentWarning ? 'visible' : 'hidden',
  }),
  button: props => ({
    pointerEvents: 'auto',
    bottom: 0,
    color: 'white',
    minWidth: theme.spacing(22),
    backgroundColor: props.contentWarning ? 'black' : checkBlue,
    border: '2px solid white',
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

const AspectRatioComponent = ({
  contentWarning,
  warningCreator,
  warningCategory,
  onClickExpand,
  children,
  intl,
}) => {
  const [maskContent, setMaskContent] = React.useState(contentWarning);
  const classes = useStyles({ contentWarning: contentWarning && maskContent });
  return (
    <div className={classes.container}>
      <div className={classes.innerWrapper}>
        { onClickExpand ?
          <IconButton
            onClick={onClickExpand}
            style={{
              color: white,
              backgroundColor: black32,
              position: 'absolute',
              right: '0',
              top: '0',
              margin: units(2),
              zIndex: contentWarning && maskContent ? 15 : 150,
            }}
          >
            <FullscreenIcon style={{ width: units(4), height: units(4) }} />
          </IconButton> : null
        }
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
              <VisibilityOffIcon className={classes.icon} />
              <div style={{ visibility: contentWarning && maskContent ? 'visible' : 'hidden' }}>
                <Typography variant="body1">
                  <FormattedHTMLMessage
                    id="contentScreen.warning"
                    defaultMessage="<strong>{user_name}</strong> has detected this content as <strong>{warning_category}</strong>"
                    description="Content warning displayed over sensitive content"
                    values={{
                      user_name: warningCreator,
                      warning_category: (
                        (messages[warningCategory] && intl.formatMessage(messages[warningCategory])) ||
                        warningCategory
                      ),
                    }}
                  />
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

AspectRatioComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

export default injectIntl(AspectRatioComponent);
