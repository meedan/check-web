import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import styles from './SuperAdminControls.module.css';

const SuperAdminControls = ({
  handleSuperAdminMask,
  handleSuperAdminMaskSession,
}) => {
  const superAdminMaskSession = sessionStorage.getItem('superAdminMaskSession');
  const maskSession = superAdminMaskSession !== 'false';
  const [superAdminmaskContent, setSuperAdminMaskContent] = React.useState(maskSession);
  const [superAdminMaskContentSession, setSuperAdminMaskContentSession] = React.useState(maskSession);

  const handleSuperAdminClickPage = () => {
    const newValue = !superAdminmaskContent;
    setSuperAdminMaskContent(newValue);
    handleSuperAdminMask(newValue);
  };

  const handleSuperAdminClickSession = () => {
    const newValue = !superAdminMaskContentSession;
    setSuperAdminMaskContentSession(newValue);
    handleSuperAdminMaskSession(newValue);
    // Call methods for apply admin screen on this page to apply session action to current page
    setSuperAdminMaskContent(newValue);
    handleSuperAdminMask(newValue);
  };

  return (
    <React.Fragment>
      <div
        id="super-admin__controls"
        className={styles.superAdminBox}
      >
        {
          superAdminmaskContent ?
            <ButtonMain
              theme="lightError"
              size="small"
              variant="contained"
              onClick={handleSuperAdminClickPage}
              label={
                <FormattedMessage
                  id="superAdminControls.remove"
                  defaultMessage="Remove admin screen on this page"
                  description="A label on a button that remove admin screen."
                />
              }
            /> :
            <ButtonMain
              theme="lightError"
              size="small"
              variant="contained"
              onClick={handleSuperAdminClickPage}
              label={
                <FormattedMessage
                  id="superAdminControls.apply"
                  defaultMessage="Apply admin screen on this page"
                  description="A label on a button that apply admin screen."
                />
              }
            />
        }
        {
          superAdminMaskContentSession ?
            <ButtonMain
              theme="lightError"
              size="small"
              variant="contained"
              onClick={handleSuperAdminClickSession}
              label={
                <FormattedMessage
                  id="superAdminControls.pause"
                  defaultMessage="Pause admin screen for this session"
                  description="A label on a button that pause admin screen for current session."
                />}
            /> :
            <ButtonMain
              theme="lightError"
              size="small"
              variant="contained"
              onClick={handleSuperAdminClickSession}
              label={
                <FormattedMessage
                  id="superAdminControls.play"
                  defaultMessage="Resume admin screen for this session"
                  description="A label on a button that pause admin screen for current session."
                />
              }
            />
        }
      </div>
    </React.Fragment>
  );
};

SuperAdminControls.propTypes = {
  handleSuperAdminMask: PropTypes.func.isRequired,
  handleSuperAdminMaskSession: PropTypes.func.isRequired,
};

export default SuperAdminControls;
