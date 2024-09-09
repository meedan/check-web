/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Dialog } from '@material-ui/core';
import cx from 'classnames/bind';
import IconClose from '../../../icons/clear.svg';
import ButtonMain from '../buttons-checkboxes-chips/ButtonMain';
import { ToggleButton, ToggleButtonGroup } from '../inputs/ToggleButtonGroup';
import MediaRequests from '../../media/MediaRequests';
import { MediaCardLargeQueryRenderer } from '../../media/MediaCardLarge';
import FeedItemMediaDialog from '../../feed/FeedItemMediaDialog';
import dialogStyles from '../../../styles/css/dialog.module.css';
import styles from './MediaAndRequestsDialog.module.css';

const MediaAndRequestsDialogComponent = ({
  feedId,
  mediaHeader,
  mediaSlug,
  onClick,
  onClose,
  projectMediaId,
  projectMediaImportedId,
}) => {
  const [context, setContext] = React.useState(projectMediaId ? 'workspace' : 'feed');

  return (
    <Dialog
      className={dialogStyles['dialog-window']}
      fullWidth
      maxWidth="md"
      open={projectMediaId || projectMediaImportedId}
      onClick={onClick}
      onClose={onClose}
    >
      <div className={dialogStyles['dialog-title']}>
        {mediaSlug}
        <ButtonMain
          className={dialogStyles['dialog-close-button']}
          iconCenter={<IconClose />}
          size="small"
          theme="text"
          variant="text"
          onClick={onClose}
        />
      </div>
      <div className={cx(dialogStyles['dialog-content'], styles['media-requests-dialog'])}>
        {mediaHeader}
        <div className={styles.columns}>
          { context === 'workspace' ?
            <>
              <MediaCardLargeQueryRenderer projectMediaId={projectMediaId} />
              <div>
                { projectMediaId && projectMediaImportedId && ( // Show the toggle if we have two values to switch between
                  <div className={styles.toggle}>
                    <ToggleButtonGroup
                      exclusive
                      fullWidth
                      size="small"
                      value={context}
                      variant="contained"
                      onChange={(e, newValue) => setContext(newValue)}
                    >
                      <ToggleButton key="1" value="workspace">
                        <FormattedMessage defaultMessage="Tipline Requests" description="Tab for choosing which requests to list in imported media dialog." id="mediaAndRequestsDialogComponent.contextWorkspace" />
                      </ToggleButton>
                      <ToggleButton key="2" value="feed">
                        <FormattedMessage defaultMessage="Imported Requests" description="Tab for choosing which requests to list in imported media dialog." id="mediaAndRequestsDialogComponent.contextFeed" />
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </div>
                )}
                <MediaRequests media={{ dbid: projectMediaId }} />
              </div>
            </> :
            null
          }
          { context === 'feed' ?
            <FeedItemMediaDialog feedDbid={feedId} itemDbid={projectMediaImportedId} /> :
            null
          }
        </div>
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
