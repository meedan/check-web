import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';
import Typography from '@material-ui/core/Typography';
import ConfirmProceedDialog from './layout/ConfirmProceedDialog';
import globalStrings from '../globalStrings';

const NavigateAwayDialog = ({
  title,
  body,
  hasUnsavedChanges,
  router,
  cancelLabel,
  proceedLabel,
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
      open={leaveLocation}
      title={title}
      body={
        <div>
          <Typography variant="body1" component="p" paragraph>
            {body}
          </Typography>
        </div>
      }
      proceedLabel={proceedLabel}
      onProceed={handleConfirmLeave}
      cancelLabel={cancelLabel}
      onCancel={handleCancelLeave}
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
  cancelLabel: <FormattedMessage {...globalStrings.cancel} />,
  proceedLabel: <FormattedMessage {...globalStrings.ok} />,
};

export default withRouter(NavigateAwayDialog);
