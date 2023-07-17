import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from 'react-intl';
import styles from './SuperAdminControls.module.css';

const SuperAdminControls = ({
  handleSuperAdminMask,
  handleSuperAdminMaskSession,
}) => {
  const superAdminMaskSession = sessionStorage.getItem('superAdminMaskSession');
  const maskSession = superAdminMaskSession === null || superAdminMaskSession === 'true';
  const [superAdminmaskContent, setSuperAdminMaskContent] = React.useState(maskSession);
  const [superAdminmaskContentSession, setSuperAdminMaskContentSession] = React.useState(maskSession);

  const handleSuperAdminClickPage = () => {
    const newValue = !superAdminmaskContent;
    setSuperAdminMaskContent(newValue);
    handleSuperAdminMask(newValue);
  };

  const handleSuperAdminClickSession = () => {
    const newValue = !superAdminmaskContentSession;
    setSuperAdminMaskContentSession(newValue);
    handleSuperAdminMaskSession(newValue);
  };

  return (
    <React.Fragment>
      <Box
        id="super-admin__controls"
        display="flex"
        px={2}
        py={1}
        justifyContent="space-between"
        bgcolor="var(--grayBackground)"
        position="fixed"
        className={styles.superAdminBox}
      >
        {
          superAdminmaskContent ?
            <Button
              className={styles.superAdminRemoveButton}
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
              className={styles.superAdminApplyButton}
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
        {
          superAdminmaskContentSession ?
            <Button
              className={styles.superAdminRemoveButton}
              variant="outlined"
              onClick={handleSuperAdminClickSession}
            >
              <FormattedMessage
                id="superAdminControls.pause"
                defaultMessage="Pause admin screen for this session"
                description="A label on a button that pause admin screen for current session."
              />
            </Button> :
            <Button
              className={styles.superAdminApplyButton}
              variant="outlined"
              onClick={handleSuperAdminClickSession}
            >
              <FormattedMessage
                id="superAdminControls.play"
                defaultMessage="Resume admin screen for this session"
                description="A label on a button that pause admin screen for current session."
              />
            </Button>
        }
      </Box>
    </React.Fragment>
  );
};

SuperAdminControls.propTypes = {
  handleSuperAdminMask: PropTypes.func.isRequired,
  handleSuperAdminMaskSession: PropTypes.func.isRequired,
};

export default SuperAdminControls;
