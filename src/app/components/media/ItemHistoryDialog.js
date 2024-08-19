import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import MediaLog from './MediaLog';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import CloseIcon from '../../icons/clear.svg';
import styles from '../../styles/css/dialog.module.css';

const ItemHistoryDialog = ({
  onClose,
  open,
  projectMedia,
  team,
}) => (
  <Dialog
    className={styles['dialog-window']}
    fullWidth
    open={open}
    onClose={onClose}
  >
    <div className={styles['dialog-title']}>
      <FormattedMessage defaultMessage="Item history" description="Dialog window title for the item's history" id="ItemHistoryDialog.title" tagName="h6" />
      <ButtonMain
        buttonProps={{
          id: 'item-history__close-button',
        }}
        className={styles['dialog-close-button']}
        iconCenter={<CloseIcon />}
        size="small"
        theme="text"
        variant="text"
        onClick={onClose}
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
