/* eslint-disable react/sort-prop-types */
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
            iconLeft={<IconArrowBack />}
            label={
              <FormattedMessage defaultMessage="Back" description="Button label to take the user to the previous view" id="ruleToolbar.back" />
            }
            size="default"
            theme="text"
            variant="text"
            onClick={handleConfirmLeave}
          />
        </div>
        <div className={styles.rulesToolbarSection}>
          <ButtonMain
            className="int-rules-toolbar__button--more-menu"
            disabled={props.actionsDisabled}
            label={<FormattedMessage defaultMessage="More" description="Menu item for additional actions that can be performed on the current rule" id="ruleToolbar.more" />}
            size="default"
            theme="text"
            variant="outlined"
            onClick={e => setAnchorEl(e.currentTarget)}
          />
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => { props.onDuplicateRule(); setAnchorEl(null); }}>
              <FormattedMessage defaultMessage="Duplicate" description="Menu label to duplicate this rule" id="ruleToolbar.duplicate" />
            </MenuItem>
            <MenuItem onClick={() => { handleConfirmDelete(); setAnchorEl(null); }}>
              <FormattedMessage defaultMessage="Delete" description="Menu label to delete the current rule" id="ruleToolbar.delete" />
            </MenuItem>
          </Menu>
          <ButtonMain
            className="rules__save-button"
            label={
              <FormattedMessage defaultMessage="Save" description="Button label to save the changes to the current rule" id="rulesTableToolbar.save" />
            }
            size="default"
            theme="info"
            variant="contained"
            onClick={props.onSaveRule}
          />
        </div>
      </Toolbar>
      <ConfirmProceedDialog
        body={(
          <div>
            <FormattedMessage
              defaultMessage="You cannot undo this action."
              description="Warning message to the user that deletes are permanent"
              id="ruleToolbar.deleteConfirmationText"
              tagName="p"
            />
          </div>
        )}
        open={showDeleteConfirmationDialog}
        proceedLabel={<FormattedMessage defaultMessage="Delete rule" description="Label to continue deleting the current rule" id="ruleToolbar.deleteConfirmationLabel" />}
        title={
          <FormattedMessage
            defaultMessage="Are you sure you want to delete this rule?"
            description="Confirmation message so the user knows they will delete the current rule"
            id="ruleToolbar.deleteConfirmationTitle"
          />
        }
        onCancel={handleCloseDialogs}
        onProceed={handleDeleteConfirmed}
      />
      <ConfirmDialog
        blurb={
          <FormattedMessage
            defaultMessage="If you continue, you will lose your changes."
            description="Additional warning text about losing changes if the user navigates away."
            id="ruleToolbar.leaveConfirmationText"
            tagName="p"
          />
        }
        handleClose={handleCloseDialogs}
        handleConfirm={handleLeaveConfirmed}
        open={showLeaveConfirmationDialog}
        title={
          <FormattedMessage
            defaultMessage="Close without saving?"
            description="Confirmation message for the user to leave the page without saving their changes"
            id="ruleToolbar.leaveConfirmationTitle"
          />
        }
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
