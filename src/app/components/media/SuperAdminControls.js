import React from 'react';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
  remove: {
    color: 'red',
    borderColor: 'red',
  },
  apply: {
    color: 'green',
    borderColor: 'green',
  },
});

const SuperAdminControls = () => {
  const classes = useStyles();
  const [superAdminmaskContent, setSuperAdminMaskContent] = React.useState(false);

  const handleSuperAdminClick = () => {
    const newValue = !superAdminmaskContent;
    setSuperAdminMaskContent(newValue);
    // TODO: save value in memory
    // window.storage.set('superAdminMask', newValue);
  };

  return (
    <React.Fragment>
      <Box
        id="super-admin__controls"
        display="flex"
        px={2}
        py={1}
        justifyContent="space-between"
        bgcolor="lightgray"
        position="fixed"
        style={{ bottom: 0, gap: 16 }}
      >
        {
          superAdminmaskContent ?
            <Button
              className={['super-admin-controls_apply', classes.apply].join(' ')}
              variant="outlined"
              onClick={handleSuperAdminClick}
            >
              <FormattedMessage
                id="superAdminControls.apply"
                defaultMessage="Apply admin screen on this page"
                description="A label on a button that apply admin screen."
              />
            </Button> :
            <Button
              className={['super-admin-controls_remove', classes.remove].join(' ')}
              variant="outlined"
              onClick={handleSuperAdminClick}
            >
              <FormattedMessage
                id="superAdminControls.remove"
                defaultMessage="Remove admin screen on this page"
                description="A label on a button that remove admin screen."
              />
            </Button>
        }
        <Button
          className={['super-admin-controls_pause', classes.remove].join(' ')}
          variant="outlined"
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

export default SuperAdminControls;
