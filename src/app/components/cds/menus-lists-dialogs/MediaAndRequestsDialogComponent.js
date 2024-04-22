import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { FormattedMessage } from 'react-intl';
import {
  Dialog,
  Grid,
} from '@material-ui/core';
import IconClose from '../../../icons/clear.svg';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import MediaRequests from '../../media/MediaRequests';
import { MediaCardLargeQueryRenderer } from '../../media/MediaCardLarge';
import FeedItemMediaDialog from '../../feed/FeedItemMediaDialog';
import { ToggleButton, ToggleButtonGroup } from '../inputs/ToggleButtonGroup';
import styles from '../../../styles/css/dialog.module.css';

const useStyles = makeStyles(theme => ({
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(2),
  },
  shut: {
    position: 'relative',

    '&::after': {
      content: '\'\'',
      backgroundColor: 'var(--brandBorder)',
      position: 'absolute',
      left: '50%',
      top: '0',
      bottom: '0',
      width: '1px',
    },
  },
  mediaColumn: {
    height: '100%',
    maxHeight: '700px',
    overflowY: 'auto',
    paddingRight: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  requestsColumn: {
    maxHeight: '700px',
    overflowY: 'auto',
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
}));

const MediaAndRequestsDialogComponent = ({
  mediaSlug,
  mediaHeader,
  projectMediaId,
  initialContext,
  onClick,
  onClose,
}) => {
  const classes = useStyles();
  const [context, setContext] = React.useState(initialContext);

  return (
    <Dialog
      className={styles['dialog-window']}
      open={projectMediaId}
      onClick={onClick}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <div className={styles['dialog-title']}>
        {mediaSlug}
        <ButtonMain
          className={styles['dialog-close-button']}
          variant="text"
          size="small"
          theme="text"
          iconCenter={<IconClose />}
          onClick={onClose}
        />
      </div>
      <div className={styles['dialog-content']}>
        { initialContext === 'workspace' && mediaHeader }
        <Grid container className={classes.shut}>
          { context === 'workspace' ?
            <>
              <Grid item xs={6} className={classes.mediaColumn}>
                <MediaCardLargeQueryRenderer projectMediaId={projectMediaId} />
              </Grid>
              <Grid item xs={6} className={classes.requestsColumn}>
                <ToggleButtonGroup
                  value={context}
                  variant="contained"
                  onChange={(e, newValue) => setContext(newValue)}
                  size="small"
                  exclusive
                  fullWidth
                >
                  <ToggleButton value="workspace" key="1">
                    <FormattedMessage id="mediaAndRequestsDialogComponent.contextWorkspace" defaultMessage="Tipline Requests" description="Tab for choosing which requests to list in imported media dialog." />
                  </ToggleButton>
                  <ToggleButton value="feed" key="2">
                    <FormattedMessage id="mediaAndRequestsDialogComponent.contextFeed" defaultMessage="Imported Requests" description="Tab for choosing which requests to list in imported media dialog." />
                  </ToggleButton>
                </ToggleButtonGroup>
                <MediaRequests media={{ dbid: projectMediaId }} />
              </Grid>
            </> :
            null
          }
          { context === 'feed' ?
            <FeedItemMediaDialog itemDbid={projectMediaId} classes={classes} /> :
            null
          }
        </Grid>
      </div>
    </Dialog>
  );
};

MediaAndRequestsDialogComponent.defaultProps = {
  initialContext: 'workspace', // or 'feed'
  mediaHeader: null,
};

MediaAndRequestsDialogComponent.propTypes = {
  mediaSlug: PropTypes.element.isRequired,
  mediaHeader: PropTypes.element,
  projectMediaId: PropTypes.number.isRequired,
  initialContext: PropTypes.oneOf(['feed', 'workspace']),
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MediaAndRequestsDialogComponent;
