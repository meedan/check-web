import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FlashMessageSetterContext } from './FlashMessage';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import ConfirmProceedDialog from './layout/ConfirmProceedDialog';
import Tooltip from './cds/alerts-and-prompts/Tooltip';
import ExportIcon from '../icons/ios_share.svg';

const mutation = graphql`
  mutation ExportListExportListMutation($input: ExportListInput!) {
    exportList(input: $input) {
      success
    }
  }
`;

const ExportList = ({ filters, type }) => {
  const { email } = window.Check.store.getState().app.context.currentUser;
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const handleClick = () => {
    setShowConfirmationDialog(true);
  };

  const handleCancel = () => {
    setShowConfirmationDialog(false);
  };

  const onError = () => {
    setFlashMessage(
      <FormattedMessage
        defaultMessage="Export failed. Please ensure you have the necessary permissions to perform this operation and that the number of results is fewer than 10,000."
        description="Message displayed when list export fails."
        id="exportList.error"
      />,
      'error',
    );
  };

  const onCompleted = (response) => {
    if (response.exportList.success) {
      setFlashMessage(
        <FormattedMessage
          defaultMessage="Export started. You'll receive an email when it's ready."
          description="Message displayed when list is exported successfully."
          id="exportList.success"
        />,
        'success',
      );
    } else {
      onError();
    }
  };

  const handleProceed = () => {
    handleCancel();
    commitMutation(Relay.Store, {
      mutation,
      variables: {
        input: {
          type,
          query: JSON.stringify(filters),
        },
      },
      onCompleted,
      onError,
    });
  };

  return (
    <>
      <Tooltip
        arrow
        title={
          <FormattedMessage
            defaultMessage="Export List Contents"
            description="Tooltip for the export list button"
            id="exportList.tooltip"
          />
        }
      >
        <span>
          <ButtonMain
            iconCenter={<ExportIcon />}
            theme="lightText"
            onClick={handleClick}
          />
        </span>
      </Tooltip>

      { showConfirmationDialog && (
        <ConfirmProceedDialog
          body={
            <FormattedHTMLMessage
              defaultMessage="To generate a spreadsheet (.csv) export of the contents of this list, select <b>Start Export</b> below.<br /><br />When your export is ready for download, you will receive an email confirmation at:<br /><b>{email}</b>"
              description="Confirmation message displayed on the export list modal."
              id="exportList.confirmationMessage"
              tagName="p"
              values={{ email }}
            />
          }
          open={showConfirmationDialog}
          proceedLabel={
            <FormattedMessage
              defaultMessage="Start Export"
              description="Label of the export list confirmation button."
              id="exportList.confirmationButtonLabel"
            />
          }
          title={
            <FormattedMessage
              defaultMessage="Export List Contents?"
              description="Title of the export list confirmation dialog."
              id="exportList.confirmationTitle"
            />
          }
          onCancel={handleCancel}
          onProceed={handleProceed}
        />
      )}
    </>
  );
};

ExportList.defaultProps = {
  filters: {},
};

ExportList.propTypes = {
  filters: PropTypes.object,
  type: PropTypes.oneOf(['media', 'feed', 'fact-check', 'explainer']).isRequired,
};

export default ExportList;
