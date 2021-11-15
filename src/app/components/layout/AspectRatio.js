import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { makeStyles } from '@material-ui/core/styles';
import FullscreenIcon from '@material-ui/icons/Fullscreen';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { black, black32, checkBlue, opaqueBlack38, units, white } from '../../styles/js/shared.js';

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
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: props.maskContent ? black : 'transparent',
    zIndex: 100,
    color: 'white',
  }),
  icon: props => ({
    fontSize: '40px',
    visibility: props.maskContent ? 'visible' : 'hidden',
  }),
  button: props => ({
    bottom: 0,
    color: 'white',
    minWidth: theme.spacing(22),
    backgroundColor: props.maskContent ? 'transparent' : checkBlue,
    border: '2px solid white',
    '& :hover': {
      backgroundColor: 'unset',
    },
  }),
}));

const AspectRatioComponent = ({
  annotatorName,
  warningCategory,
  contentWarning,
  onClickExpand,
  children,
}) => {
  const [maskContent, setMaskContent] = React.useState(contentWarning);
  const classes = useStyles({ maskContent });
  return (
    <div className={classes.container}>
      <div className={classes.innerWrapper}>
        <IconButton
          onClick={onClickExpand}
          style={{
            color: white,
            backgroundColor: black32,
            position: 'absolute',
            right: '0',
            top: '0',
            margin: units(2),
            zIndex: maskContent ? 15 : 150,
          }}
        >
          <FullscreenIcon style={{ width: units(4), height: units(4) }} />
        </IconButton>
        {children}
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
            <div style={{ visibility: maskContent ? 'visible' : 'hidden' }}>
              <FormattedHTMLMessage
                id="contentScreen.warning"
                defaultMessage="<strong>{user_name}</strong> has detected this content as <strong>{warning_category}</strong>"
                description="Content warning displayed over sensitive content"
                values={{
                  user_name: annotatorName,
                  warning_category: warningCategory,
                }}
              />
            </div>
            { contentWarning ? (
              <Button
                className={classes.button}
                onClick={() => setMaskContent(!maskContent)}
                size="small"
                variant="outlined"
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
            ) : null}
          </Box>
        </div>
      </div>
    </div>
  );
};

AspectRatioComponent.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AspectRatioComponent;
