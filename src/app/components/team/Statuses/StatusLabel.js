import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles({
  statusLabel: props => ({
    color: props.color,
  }),
});

const StatusLabel = (props) => {
  const classes = useStyles(props);

  return (
    <Typography className={classes.statusLabel} variant="h6" component="span">
      {props.children}
    </Typography>
  );
};

StatusLabel.propTypes = {
  children: PropTypes.node.isRequired,
};

export default StatusLabel;
