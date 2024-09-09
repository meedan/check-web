/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import ConfirmProceedDialog from './layout/ConfirmProceedDialog';

const NavigateAwayDialog = ({
  body,
  cancelLabel,
  hasUnsavedChanges,
  proceedLabel,
  router,
  title,
}) => {
  const [leaveLocation, setLeaveLocation] = React.useState(null);

  const confirmCloseBrowserWindow = (e) => {
    if (hasUnsavedChanges) {
      const message = 'Are you sure?'; // It's not displayed
      e.returnValue = message;
      return message;
    }
    e.preventDefault();
    return '';
  };

  const currentRoute = router.routes[router.routes.length - 1];

  // NOTE: Mount/unmount the component from parent based on `hasUnsavedChanges` for proper lifecycle management
  React.useEffect(() => {
    router.setRouteLeaveHook(
      currentRoute,
      (nextLocation) => {
        if (!hasUnsavedChanges || (nextLocation.state && nextLocation.state.confirmed)) {
          return true;
        }
        setLeaveLocation(nextLocation);
        return false;
      },
    );
    window.addEventListener('beforeunload', confirmCloseBrowserWindow);

    return () => {
      window.removeEventListener('beforeunload', confirmCloseBrowserWindow);
      router.setRouteLeaveHook(currentRoute, null);
    };
  }, []);

  const handleConfirmLeave = () => {
    const finalLocation = Object.assign(leaveLocation, { state: { confirmed: true } });
    router.push(finalLocation);
    setLeaveLocation(null);
  };

  const handleCancelLeave = () => {
    setLeaveLocation(null);
  };

  return (
    <ConfirmProceedDialog
      body={
        <p>
          {body}
        </p>
      }
      cancelLabel={cancelLabel}
      open={Boolean(leaveLocation)}
      proceedLabel={proceedLabel}
      title={title}
      onCancel={handleCancelLeave}
      onProceed={handleConfirmLeave}
    />
  );
};

NavigateAwayDialog.propTypes = {
  title: PropTypes.node.isRequired,
  body: PropTypes.node.isRequired,
  hasUnsavedChanges: PropTypes.bool.isRequired,
  router: PropTypes.object.isRequired,
  cancelLabel: PropTypes.node,
  proceedLabel: PropTypes.node,
};

NavigateAwayDialog.defaultProps = {
  cancelLabel: (
    <FormattedMessage
      defaultMessage="Cancel"
      description="Regular Cancel action label"
      id="global.cancel"
    />
  ),
  proceedLabel: (
    <FormattedMessage
      defaultMessage="OK"
      description="Regular OK/confirmation label"
      id="global.ok"
    />
  ),
};

export default withRouter(NavigateAwayDialog);
