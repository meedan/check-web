import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import IconClose from '../../icons/clear.svg';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import { FlashMessageSetterContext } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessage } from '../../helpers';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';


const removeExplainerItemMutation = graphql`
  mutation RemoveArticleButtonDeleteExplainerItemMutation($input: DestroyExplainerItemInput!) {
    destroyExplainerItem(input: $input) {
      deletedId
      project_media {
        id
        articles_count
      }
    }
  }
`;

const removeClaimDescriptionMutation = graphql`
  mutation RemoveArticleButtonUpdateClaimDescriptionMutation($input: UpdateClaimDescriptionInput!) {
    updateClaimDescription(input: $input) {
      claim_description {
        project_media_was {
          title
          last_status_obj {
            locked
          }
          dynamic_annotation_report_design {
            data
          }
          claim_description {
            description
            fact_check {
              title
            }
          }
        }
        project_media {
          articles_count
          report_status
          fact_check {
            id
          }
        }
      }
    }
  }
`;

const RemoveArticleButton = ({
  id,
  variant,
  disabled,
  onRemove,
}) => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const onCancel = () => {
    setOpenDialog(false);
  };

  const onCompleted = () => {
    setFlashMessage(
      <FormattedMessage
        id="removeArticleWrapperButton.success"
        defaultMessage="Article successfully removed from item."
        description="Banner displayed after an article is successfully removed from an item."
      />,
      'success');
    setRemoving(false);
    setOpenDialog(false);
    onRemove();
  };

  const onError = (error) => {
    const errorMessage = getErrorMessage(error);
    const errorComponent = errorMessage || <GenericUnknownErrorMessage />;
    setFlashMessage(errorComponent);
    setRemoving(false);
    setOpenDialog(false);
  };

  const onProceed = () => {
    if (!removing) {
      setRemoving(true);
      let input = null;
      let mutation = null;
      let configs = null;
      if (variant === 'explainer') {
        mutation = removeExplainerItemMutation;
        input = {
          id,
        };
        configs = [
          {
            type: 'NODE_DELETE',
            deletedIDFieldName: 'deletedId',
          },
        ];
      } else if (variant === 'fact-check') {
        mutation = removeClaimDescriptionMutation;
        input = {
          id,
          project_media_id: null,
        };
      }
      commitMutation(Relay.Store, {
        mutation,
        variables: {
          input,
        },
        configs,
        onCompleted,
        onError,
      });
    }
  };

  return (
    <>
      <Tooltip
        key="remove-article-button"
        title={disabled ? (
          <FormattedMessage
            id="removeArticleButton.tooltipDisabled"
            defaultMessage="You can't remove this article."
            description="Tooltip message displayed on remove article button when it is disabled."
          />
        ) : (
          <FormattedMessage
            id="removeArticleButton.tooltip"
            defaultMessage="Remove article from media cluster"
            description="Tooltip message displayed on remove article button."
          />
        )}
        arrow
      >
        <span>
          <ButtonMain
            disabled={disabled}
            size="small"
            theme="text"
            iconCenter={<IconClose />}
            onClick={() => setOpenDialog(true)}
          />
        </span>
      </Tooltip>
      <ConfirmProceedDialog
        open={openDialog}
        title={
          <FormattedMessage
            id="removeArticleButton.confirmationDialogTitle"
            defaultMessage="Are you sure you want to remove this article?"
            description="Title displayed on a confirmation modal when a user tries to remove an article."
          />
        }
        body={
          <FormattedMessage
            tagName="p"
            id="removeArticleButton.confirmationDialogBody"
            defaultMessage="This article will no longer be associated with this media item but will remain in your workspace."
            description="Confirmation message displayed on a modal when a user tries to remove an article."
          />
        }
        onCancel={onCancel}
        onProceed={onProceed}
        proceedLabel={
          <FormattedMessage
            id="removeArticleButton.removeButton"
            defaultMessage="Remove article"
            description="Button label to remove article from item"
          />
        }
      />
    </>
  );
};

RemoveArticleButton.defaultProps = {
  disabled: false,
  onRemove: () => {},
};

RemoveArticleButton.propTypes = {
  variant: PropTypes.oneOf(['explainer', 'fact-check']).isRequired,
  id: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onRemove: PropTypes.func,
};

export default RemoveArticleButton;
