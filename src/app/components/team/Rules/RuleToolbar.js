import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Toolbar from '@material-ui/core/Toolbar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import IconArrowBack from '../../../icons/arrow_back.svg';
import ConfirmDialog from '../../layout/ConfirmDialog';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import styles from './Rules.module.css';

const RuleToolbar = (props) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showDeleteConfirmationDialog, setShowDeleteConfirmationDialog] = React.useState(false);
  const [showLeaveConfirmationDialog, setShowLeaveConfirmationDialog] = React.useState(false);

  const handleConfirmDelete = () => {
    setShowDeleteConfirmationDialog(true);
  };

  const handleDeleteConfirmed = () => {
    setShowDeleteConfirmationDialog(false);
    props.onDeleteRule();
  };

  const handleConfirmLeave = () => {
    if (props.unsavedChanges) {
      setShowLeaveConfirmationDialog(true);
    } else {
      props.onGoBack();
    }
  };

  const handleLeaveConfirmed = () => {
    setShowLeaveConfirmationDialog(false);
    props.onGoBack();
  };

  const handleCloseDialogs = () => {
    setShowDeleteConfirmationDialog(false);
    setShowLeaveConfirmationDialog(false);
  };

  return (
    <React.Fragment>
      <Toolbar className={styles['rules-toolbar']}>
        <div className={styles.rulesToolbarSection}>
          <ButtonMain
            size="default"
            theme="text"
            variant="text"
            onClick={handleConfirmLeave}
            iconLeft={<IconArrowBack />}
            label={
              <FormattedMessage id="ruleToolbar.back" defaultMessage="Back" description="Button label to take the user to the previous view" />
            }
          />
        </div>
        <div className={styles.rulesToolbarSection}>
          <ButtonMain
            className="int-rules-toolbar__button--more-menu"
            disabled={props.actionsDisabled}
            variant="outlined"
            size="default"
            theme="text"
            label={<FormattedMessage id="ruleToolbar.more" defaultMessage="More" description="Menu item for additional actions that can be performed on the current rule" />}
            onClick={e => setAnchorEl(e.currentTarget)}
          />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => { props.onDuplicateRule(); setAnchorEl(null); }}>
              <FormattedMessage id="ruleToolbar.duplicate" defaultMessage="Duplicate" description="Menu label to duplicate this rule" />
            </MenuItem>
            <MenuItem onClick={() => { handleConfirmDelete(); setAnchorEl(null); }}>
              <FormattedMessage id="ruleToolbar.delete" defaultMessage="Delete" description="Menu label to delete the current rule" />
            </MenuItem>
          </Menu>
          <ButtonMain
            theme="brand"
            variant="contained"
            size="default"
            className="rules__save-button"
            onClick={props.onSaveRule}
            label={
              <FormattedMessage id="rulesTableToolbar.save" defaultMessage="Save" description="Button label to save the changes to the current rule" />
            }
          />
        </div>
      </Toolbar>
      <ConfirmProceedDialog
        open={showDeleteConfirmationDialog}
        title={
          <FormattedMessage
            id="ruleToolbar.deleteConfirmationTitle"
            defaultMessage="Are you sure you want to delete this rule?"
            description="Confirmation message so the user knows they will delete the current rule"
          />
        }
        body={(
          <div>
            <FormattedMessage
              tagName="p"
              id="ruleToolbar.deleteConfirmationText"
              defaultMessage="You cannot undo this action."
              description="Warning message to the user that deletes are permanent"
            />
          </div>
        )}
        proceedLabel={<FormattedMessage id="ruleToolbar.deleteConfirmationLabel" defaultMessage="Delete rule" description="Label to continue deleting the current rule" />}
        onProceed={handleDeleteConfirmed}
        onCancel={handleCloseDialogs}
      />
      <ConfirmDialog
        open={showLeaveConfirmationDialog}
        title={
          <FormattedMessage
            id="ruleToolbar.leaveConfirmationTitle"
            defaultMessage="Close without saving?"
            description="Confirmation message for the user to leave the page without saving their changes"
          />
        }
        blurb={
          <FormattedMessage
            tagName="p"
            id="ruleToolbar.leaveConfirmationText"
            defaultMessage="If you continue, you will lose your changes."
            description="Additional warning text about losing changes if the user navigates away."
          />
        }
        handleClose={handleCloseDialogs}
        handleConfirm={handleLeaveConfirmed}
      />
    </React.Fragment>
  );
};

RuleToolbar.propTypes = {
  actionsDisabled: PropTypes.bool.isRequired,
  unsavedChanges: PropTypes.bool.isRequired,
  onGoBack: PropTypes.func.isRequired,
  onSaveRule: PropTypes.func.isRequired,
  onDeleteRule: PropTypes.func.isRequired,
  onDuplicateRule: PropTypes.func.isRequired,
};

export default RuleToolbar;
