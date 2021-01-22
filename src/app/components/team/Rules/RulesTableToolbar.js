import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import DeleteIcon from '@material-ui/icons/Delete';
import Button from '@material-ui/core/Button';
import SettingsHeader from '../SettingsHeader';
import ConfirmDialog from '../../layout/ConfirmDialog';

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
          />
        }
        subtitle={
          <FormattedMessage
            id="rulesTableToolbar.subtitle"
            defaultMessage="Create automations to organize lists and customize your workflow."
          />
        }
        helpUrl="https://help.checkmedia.org/en/articles/3623179-automation-and-filtering-rules"
        actionButton={
          <Button color="primary" variant="contained" className={[classes.button, 'rules__new-rule'].join(' ')} onClick={props.onAddNewRule}>
            <FormattedMessage id="rulesTableToolbar.add" defaultMessage="New rule" />
          </Button>
        }
      />
      { numSelected > 0 ?
        <Toolbar
          className={clsx(classes.root, {
            [classes.highlight]: numSelected > 0,
          })}
        >
          <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
            <FormattedMessage
              id="rulesTableToolbar.selected"
              defaultMessage="{numSelected, plural, one {# selected} other {# selected}}"
              values={{ numSelected }}
            />
          </Typography>
          <Tooltip
            title={
              <FormattedMessage id="rulesTableToolbar.delete" defaultMessage="Delete" />
            }
          >
            <IconButton onClick={handleConfirmDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Toolbar> : null }
      <ConfirmDialog
        open={showDeleteConfirmationDialog}
        title={
          <FormattedMessage
            id="rulesTableToolbar.deleteConfirmationTitle"
            defaultMessage="Delete selected rules?"
          />
        }
        blurb={
          <FormattedMessage
            id="rulesTableToolbar.deleteConfirmationText"
            defaultMessage="Are you sure you want to delete these rules?"
          />
        }
        handleClose={handleCloseDialogs}
        handleConfirm={handleDeleteConfirmed}
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
