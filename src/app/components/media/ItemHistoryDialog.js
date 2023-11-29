import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import MediaLog from './MediaLog';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import CloseIcon from '../../icons/clear.svg';
import styles from '../../styles/css/dialog.module.css';

const ItemHistoryDialog = ({
  open,
  projectMedia,
  team,
  onClose,
}) => (
  <Dialog
    className={styles['dialog-window']}
    open={open}
    onClose={onClose}
    fullWidth
  >
    <div className={styles['dialog-title']}>
      <FormattedMessage tagName="h6" id="ItemHistoryDialog.title" defaultMessage="Item history" description="Dialog window title for the item's history" />
      <ButtonMain
        variant="text"
        size="small"
        theme="text"
        iconCenter={<CloseIcon />}
        onClick={onClose}
        className={styles['dialog-close-button']}
        buttonProps={{
          id: 'item-history__close-button',
        }}
      />
    </div>
    <div className={styles['dialog-content']}>
      <MediaLog
        media={projectMedia}
        team={team}
      />
    </div>
  </Dialog>
);

ItemHistoryDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  projectMedia: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ItemHistoryDialog;
