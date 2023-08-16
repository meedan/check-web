import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import DeleteIcon from '../../../icons/delete.svg';
import SettingsHeader from '../SettingsHeader';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    display: 'flex',
    justifyContent: 'space-between',
  },
  highlight: {
    color: theme.palette.secondary.main,
    backgroundColor: lighten(theme.palette.secondary.light, 0.85),
  },
  title: {
    flex: '1 1 100%',
    alignSelf: 'center',
  },
  button: {
    whiteSpace: 'nowrap',
  },
}));

const RulesTableToolbar = (props) => {
  const classes = useToolbarStyles();
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
      <SettingsHeader
        title={
          <FormattedMessage
            id="rulesTableToolbar.title"
            defaultMessage="Rules"
            description="Title area for the rules admin section of the settings page"
          />
        }
        helpUrl="https://help.checkmedia.org/en/articles/4842057-automation-and-filtering-rules"
        actionButton={
          <ButtonMain
            size="default"
            theme="brand"
            variant="contained"
            className={[classes.button, 'rules__new-rule'].join(' ')}
            onClick={props.onAddNewRule}
            label={
              <FormattedMessage id="rulesTableToolbar.add" defaultMessage="New rule" description="Button label for creating a new rule" />
            }
          />
        }
      />
      { numSelected > 0 ?
        <Toolbar
          className={cx(
            classes.root,
            {
              [classes.highlight]: numSelected > 0,
            })
          }
        >
          <div className={cx('typography-subtitle1', classes.title)}>
            <FormattedMessage
              id="rulesTableToolbar.selected"
              defaultMessage="{numSelected, plural, one {# selected} other {# selected}}"
              description="When rules are selected to perform bulk actions on, this text tells the user how many have been selected"
              values={{ numSelected }}
              description="A label that tells the user how many rules have been selected"
            />
          </div>
          <Tooltip
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
        </Toolbar> : null }
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
  onAddNewRule: PropTypes.func.isRequired,
  onDeleteRules: PropTypes.func.isRequired,
};

export default RulesTableToolbar;
