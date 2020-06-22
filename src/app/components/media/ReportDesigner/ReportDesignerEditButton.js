import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconEdit from '@material-ui/icons/Edit';

const useStyles = makeStyles(theme => ({
  button: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
}));

const ReportDesignerEditButton = (props) => {
  const classes = useStyles();

  return (
    <Button
      variant="contained"
      color="primary"
      disabled={props.disabled}
      onClick={props.onClick}
      className={classes.button}
    >
      <IconEdit />
      {props.label}
    </Button>
  );
};

ReportDesignerEditButton.defaultProps = {
  disabled: false,
};

ReportDesignerEditButton.propTypes = {
  label: PropTypes.object.isRequired,
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default ReportDesignerEditButton;
