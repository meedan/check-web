import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import DeleteIcon from '../../../icons/delete.svg';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import styles from '../Settings.module.css';

const RulesTableToolbar = (props) => {
  const { numSelected } = props;
  const [showDeleteConfirmationDialog, setShowDeleteConfirmationDialog] = React.useState(false);

  const handleConfirmDelete = () => {
    setShowDeleteConfirmationDialog(true);
  };

  const handleDeleteConfirmed = () => {
    setShowDeleteConfirmationDialog(false);
    props.onDeleteRules();
  };

  const handleCloseDialogs = () => {
    setShowDeleteConfirmationDialog(false);
  };

  return (
    <React.Fragment>
      { numSelected > 0 ?
        <div className={cx(styles['table-toolbar'])}>
          <div className={cx(styles['table-toolbar-summary'])}>
            <FormattedMessage
              defaultMessage="{numSelected, plural, one {# selected} other {# selected}}"
              description="When rules are selected to perform bulk actions on, this text tells the user how many have been selected"
              id="rulesTableToolbar.selected"
              values={{ numSelected }}
            />
          </div>
          <div className={cx(styles['table-toolbar-actions'])}>
            <Tooltip
              arrow
              title={
                <FormattedMessage defaultMessage="Delete" description="Tooltip for deleting rules" id="rulesTableToolbar.delete" />
              }
            >
              <span>
                <ButtonMain
                  iconCenter={<DeleteIcon />}
                  size="default"
                  theme="text"
                  variant="text"
                  onClick={handleConfirmDelete}
                />
              </span>
            </Tooltip>
          </div>
        </div> : null }
      <ConfirmProceedDialog
        body={
          <div>
            <p className="typography-body1">
              <FormattedMessage
                defaultMessage="{numSelected, plural, one {You have selected # rule for deletion. Do you want to delete it? You cannot undo this action.} other {You have selected # rules for deletion. Do you want to delete all of them? You cannot undo this action.}}"
                description="Details of what will happen when one or more rules are deleted show in a modal confirmation"
                id="rulesTableToolbar.deleteConfirmationText"
                values={{ numSelected }}
              />
            </p>
          </div>
        }
        open={showDeleteConfirmationDialog}
        proceedLabel={
          <FormattedMessage
            defaultMessage="{numSelected, plural, one {Delete # rule} other {Delete # rules}}"
            description="Label for proceeding to delete the selected rules"
            id="rulesTableToolbar.deleteConfirmationLabel"
            values={{ numSelected }}
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Do you want to delete the selected rules?"
            description="Title for the confirmation dialog when the user is trying to delete rules"
            id="rulesTableToolbar.deleteConfirmationTitle"
          />
        }
        onCancel={handleCloseDialogs}
        onProceed={handleDeleteConfirmed}
      />
    </React.Fragment>
  );
};

RulesTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onDeleteRules: PropTypes.func.isRequired,
};

export default RulesTableToolbar;
