/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { TextField } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CopyToClipboard from 'react-copy-to-clipboard';

const useStyles = makeStyles(theme => ({
  popover: {
    padding: theme.spacing(2),
  },
  button: {
    margin: theme.spacing(2),
  },
}));

const ReportDesignerCopyToClipboard = (props) => {
  const classes = useStyles();
  const { label, value } = props;
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpen = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const open = Boolean(anchorEl);

  return (
    <React.Fragment>
      <CopyToClipboard text={value}>
        <Button onClick={handleOpen} className={['report-designer__actions-copy', props.className].join(' ')}> {/* Class names for integration test */}
          {label}
        </Button>
      </CopyToClipboard>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
      >
        <Box className={classes.popover}>
          <Typography color="error">
            <FormattedMessage
              id="reportDesigner.warning"
              defaultMessage="Warning — sharing this will expose information to people outside your private workspace. Proceed with caution."
            />
          </Typography>
          <Box display="flex" alignItems="center">
            <TextField
              className={props.className}
              defaultValue={value}
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
              fullWidth
            />
            <Typography variant="button" className={classes.button}>
              <FormattedMessage
                id="reportDesigner.copyButtonInactive"
                defaultMessage="Copied"
              />
            </Typography>
          </Box>
        </Box>
      </Popover>
    </React.Fragment>
  );
};

ReportDesignerCopyToClipboard.defaultProps = {
  className: '',
};

ReportDesignerCopyToClipboard.propTypes = {
  className: PropTypes.string,
  value: PropTypes.string.isRequired,
  label: PropTypes.object.isRequired,
};

export default ReportDesignerCopyToClipboard;
