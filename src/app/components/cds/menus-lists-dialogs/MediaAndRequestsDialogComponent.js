import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import {
  Dialog,
  Grid,
} from '@material-ui/core';
import IconClose from '../../../icons/clear.svg';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import { ToggleButton, ToggleButtonGroup } from '../inputs/ToggleButtonGroup';
import MediaRequests from '../../media/MediaRequests';
import { MediaCardLargeQueryRenderer } from '../../media/MediaCardLarge';
import FeedItemMediaDialog from '../../feed/FeedItemMediaDialog';
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
      backgroundColor: 'var(--color-blue-81)',
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
    maxHeight: '500px',
    overflowY: 'auto',
    paddingLeft: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
  },
  toggle: {
    backgroundColor: 'var(--brandBackground)',
    borderRadius: 8,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: 10,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    width: '50%',
    float: 'right',
  },
}));

const MediaAndRequestsDialogComponent = ({
  mediaSlug,
  mediaHeader,
  projectMediaId,
  projectMediaImportedId,
  feedId,
  onClick,
  onClose,
}) => {
  const classes = useStyles();
  const [context, setContext] = React.useState(projectMediaId ? 'workspace' : 'feed');

  return (
    <Dialog
      className={styles['dialog-window']}
      open={projectMediaId || projectMediaImportedId}
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
        {mediaHeader}
        { projectMediaId && projectMediaImportedId && ( // Show the toggle if we have two values to switch between
          <div className={classes.toggle}>
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
          </div>
        )}
        <Grid container className={classes.shut}>
          { context === 'workspace' ?
            <>
              <Grid item xs={6} className={classes.mediaColumn}>
                <MediaCardLargeQueryRenderer projectMediaId={projectMediaId} />
              </Grid>
              <Grid item xs={6} className={classes.requestsColumn}>
                <MediaRequests media={{ dbid: projectMediaId }} />
              </Grid>
            </> :
            null
          }
          { context === 'feed' ?
            <FeedItemMediaDialog itemDbid={projectMediaImportedId} feedDbid={feedId} classes={classes} /> :
            null
          }
        </Grid>
      </div>
    </Dialog>
  );
};

MediaAndRequestsDialogComponent.defaultProps = {
  mediaHeader: null,
  projectMediaImportedId: null,
  feedId: null,
};

MediaAndRequestsDialogComponent.propTypes = {
  mediaSlug: PropTypes.element.isRequired,
  mediaHeader: PropTypes.element,
  projectMediaId: PropTypes.number.isRequired,
  projectMediaImportedId: PropTypes.number,
  feedId: PropTypes.number,
  onClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default MediaAndRequestsDialogComponent;
