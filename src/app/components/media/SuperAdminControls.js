import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  remove: {
    color: '#F44336',
    borderColor: '#F44336',
    border: '2px solid',
  },
  apply: {
    color: '#4CAF50',
    borderColor: '#4CAF50',
    border: '2px solid',
  },
});

const SuperAdminControls = ({
  superAdminMask,
  handleSuperAdminMask,
  handlesuperAdminMaskSession,
}) => {
  const classes = useStyles();
  const [superAdminmaskContent, setSuperAdminMaskContent] = React.useState(superAdminMask);

  const handleSuperAdminClickPage = () => {
    const newValue = !superAdminmaskContent;
    setSuperAdminMaskContent(newValue);
    handleSuperAdminMask(newValue);
  };

  const handleSuperAdminClickSession = () => {
    // TODO: fix the logic
    handlesuperAdminMaskSession(!superAdminmaskContent);
  };

  return (
    <React.Fragment>
      <Box
        id="super-admin__controls"
        display="flex"
        px={2}
        py={1}
        justifyContent="space-between"
        bgcolor="#F7F7F7"
        position="fixed"
        style={{ bottom: 0, gap: 16 }}
      >
        {
          superAdminmaskContent ?
            <Button
              className={['super-admin-controls_remove', classes.remove].join(' ')}
              variant="outlined"
              onClick={handleSuperAdminClickPage}
            >
              <FormattedMessage
                id="superAdminControls.remove"
                defaultMessage="Remove admin screen on this page"
                description="A label on a button that remove admin screen."
              />
            </Button> :
            <Button
              className={['super-admin-controls_apply', classes.apply].join(' ')}
              variant="outlined"
              onClick={handleSuperAdminClickPage}
            >
              <FormattedMessage
                id="superAdminControls.apply"
                defaultMessage="Apply admin screen on this page"
                description="A label on a button that apply admin screen."
              />
            </Button>
        }
        <Button
          className={['super-admin-controls_pause', classes.remove].join(' ')}
          variant="outlined"
          onClick={handleSuperAdminClickSession}
        >
          <FormattedMessage
            id="superAdminControls.pause"
            defaultMessage="Pause admin screen for this session"
            description="A label on a button that pause admin screen for current session."
          />
        </Button>
      </Box>
    </React.Fragment>
  );
};

SuperAdminControls.propTypes = {
  superAdminMask: PropTypes.bool,
  handleSuperAdminMask: PropTypes.func.isRequired,
  handlesuperAdminMaskSession: PropTypes.func.isRequired,
};

SuperAdminControls.defaultProps = {
  superAdminMask: false,
};

export default SuperAdminControls;
