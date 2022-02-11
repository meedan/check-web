/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import IconArrowBack from '@material-ui/icons/ArrowBack';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ConfirmDialog from '../../layout/ConfirmDialog';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';

const useToolbarStyles = makeStyles(theme => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  side: {
    display: 'flex',
    alignItems: 'center',
  },
  select: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  input: {
    padding: theme.spacing(1.5),
  },
  button: {
    padding: theme.spacing(1),
  },
}));

const RuleToolbar = (props) => {
  const classes = useToolbarStyles();
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

  const handleChange = (event) => {
    const { value } = event.target;
    if (value === 'duplicate') {
      props.onDuplicateRule();
    } else if (value === 'delete') {
      handleConfirmDelete();
    }
  };

  const handleCloseDialogs = () => {
    setShowDeleteConfirmationDialog(false);
    setShowLeaveConfirmationDialog(false);
  };

  return (
    <React.Fragment>
      <Toolbar className={classes.root}>
        <div className={classes.side}>
          <Button
            onClick={handleConfirmLeave}
            startIcon={<IconArrowBack />}
            className={classes.button}
          >
            <FormattedMessage id="ruleToolbar.back" defaultMessage="Back" />
          </Button>
        </div>
        <div className={classes.side}>
          <FormControl variant="outlined" disabled={props.actionsDisabled}>
            <Select
              inputProps={{ className: classes.input }}
              className={classes.select}
              onChange={handleChange}
              value="more"
            >
              <MenuItem value="more">
                <FormattedMessage id="ruleToolbar.more" defaultMessage="More" />
              </MenuItem>
              <MenuItem value="duplicate">
                <FormattedMessage id="ruleToolbar.duplicate" defaultMessage="Duplicate" />
              </MenuItem>
              <MenuItem value="delete">
                <FormattedMessage id="ruleToolbar.delete" defaultMessage="Delete" />
              </MenuItem>
            </Select>
          </FormControl>
          <Button
            color="primary"
            variant="contained"
            className={[classes.button, 'rules__save-button'].join(' ')}
            onClick={props.onSaveRule}
          >
            <FormattedMessage id="rulesTableToolbar.save" defaultMessage="Save" />
          </Button>
        </div>
      </Toolbar>
      <ConfirmProceedDialog
        open={showDeleteConfirmationDialog}
        title={
          <FormattedMessage
            id="ruleToolbar.deleteConfirmationTitle"
            defaultMessage="Are you sure you want to delete this rule?"
          />
        }
        body={(
          <div>
            <Typography variant="body1" component="p" paragraph>
              <FormattedMessage
                id="ruleToolbar.deleteConfirmationText"
                defaultMessage="You cannot undo this action."
              />
            </Typography>
          </div>
        )}
        proceedLabel={<FormattedMessage id="ruleToolbar.deleteConfirmationLabel" defaultMessage="Delete rule" />}
        onProceed={handleDeleteConfirmed}
        onCancel={handleCloseDialogs}
      />
      <ConfirmDialog
        open={showLeaveConfirmationDialog}
        title={
          <FormattedMessage
            id="ruleToolbar.leaveConfirmationTitle"
            defaultMessage="Close without saving?"
          />
        }
        blurb={
          <FormattedMessage
            id="ruleToolbar.leaveConfirmationText"
            defaultMessage="If you continue, you will lose your changes."
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
