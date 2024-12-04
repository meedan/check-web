import React, { useEffect } from 'react';
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

  const updateStoredValue = (value) => {
    window.storage.set('contentMask', value);
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'contentMask',
      newValue: value,
    }));
  };

  useEffect(() => {
    // this will be later updated to pull a stored value in local storage
    // but at the moment, just reset the local storage value to the default mask value
    updateStoredValue(true);
  }, []);

  const handleSuperAdminClickPage = () => {
    const newValue = !superAdminmaskContent;
    setSuperAdminMaskContent(newValue);
    handleSuperAdminMask(newValue);
    updateStoredValue(newValue);
  };

  const handleSuperAdminClickSession = () => {
    const newValue = !superAdminMaskContentSession;
    setSuperAdminMaskContentSession(newValue);
    handleSuperAdminMaskSession(newValue);
    // Call methods for apply admin screen on this page to apply session action to current page
    setSuperAdminMaskContent(newValue);
    handleSuperAdminMask(newValue);
    updateStoredValue(newValue);
  };

  return (
    <React.Fragment>
      <div
        className={styles.superAdminBox}
        id="super-admin__controls"
      >
        {
          superAdminmaskContent ?
            <ButtonMain
              label={
                <FormattedMessage
                  defaultMessage="Remove admin screen on this page"
                  description="A label on a button that remove admin screen."
                  id="superAdminControls.remove"
                />
              }
              size="small"
              theme="lightError"
              variant="contained"
              onClick={handleSuperAdminClickPage}
            /> :
            <ButtonMain
              label={
                <FormattedMessage
                  defaultMessage="Apply admin screen on this page"
                  description="A label on a button that apply admin screen."
                  id="superAdminControls.apply"
                />
              }
              size="small"
              theme="lightError"
              variant="contained"
              onClick={handleSuperAdminClickPage}
            />
        }
        {
          superAdminMaskContentSession ?
            <ButtonMain
              label={
                <FormattedMessage
                  defaultMessage="Pause admin screen for this session"
                  description="A label on a button that pause admin screen for current session."
                  id="superAdminControls.pause"
                />}
              size="small"
              theme="lightError"
              variant="contained"
              onClick={handleSuperAdminClickSession}
            /> :
            <ButtonMain
              label={
                <FormattedMessage
                  defaultMessage="Resume admin screen for this session"
                  description="A label on a button that pause admin screen for current session."
                  id="superAdminControls.play"
                />
              }
              size="small"
              theme="lightError"
              variant="contained"
              onClick={handleSuperAdminClickSession}
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
