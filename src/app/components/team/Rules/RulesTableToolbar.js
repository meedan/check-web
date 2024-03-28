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
              id="rulesTableToolbar.selected"
              defaultMessage="{numSelected, plural, one {# selected} other {# selected}}"
              description="When rules are selected to perform bulk actions on, this text tells the user how many have been selected"
              values={{ numSelected }}
            />
          </div>
          <div className={cx(styles['table-toolbar-actions'])}>
            <Tooltip
              arrow
              title={
                <FormattedMessage id="rulesTableToolbar.delete" defaultMessage="Delete" description="Tooltip for deleting rules" />
              }
            >
              <span>
                <ButtonMain
                  iconCenter={<DeleteIcon />}
                  variant="text"
                  theme="text"
                  size="default"
                  onClick={handleConfirmDelete}
                />
              </span>
            </Tooltip>
          </div>
        </div> : null }
      <ConfirmProceedDialog
        open={showDeleteConfirmationDialog}
        title={
          <FormattedMessage
            id="rulesTableToolbar.deleteConfirmationTitle"
            defaultMessage="Do you want to delete the selected rules?"
            description="Title for the confirmation dialog when the user is trying to delete rules"
          />
        }
        body={
          <div>
            <p className="typography-body1">
              <FormattedMessage
                id="rulesTableToolbar.deleteConfirmationText"
                defaultMessage="{numSelected, plural, one {You have selected # rule for deletion. Do you want to delete it? You cannot undo this action.} other {You have selected # rules for deletion. Do you want to delete all of them? You cannot undo this action.}}"
                values={{ numSelected }}
                description="Details of what will happen when one or more rules are deleted show in a modal confirmation"
              />
            </p>
          </div>
        }
        proceedLabel={
          <FormattedMessage
            id="rulesTableToolbar.deleteConfirmationLabel"
            defaultMessage="{numSelected, plural, one {Delete # rule} other {Delete # rules}}"
            values={{ numSelected }}
            description="Label for proceeding to delete the selected rules"
          />
        }
        onProceed={handleDeleteConfirmed}
        onCancel={handleCloseDialogs}
      />
    </React.Fragment>
  );
};

RulesTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
  onDeleteRules: PropTypes.func.isRequired,
};

export default RulesTableToolbar;
