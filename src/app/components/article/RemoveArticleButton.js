import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import CancelFillIcon from '../../../icons/cancel_fill.svg';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';

const removeExplainerMutation = graphql`
  mutation RemoveArticleButtonDestroyExplainerItemMutation($input: DestroyExplainerItemInput!) {
    updateExplainer(input: $input) {
      project_media {
        id
        fact_check {
          id
        }
        explainers(first: 100) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`;

const removeFactCheckMutation = graphql`
  mutation RemoveArticleButtonUpdateClaimDescriptionMutation($input: UpdateClaimDescriptionInput!) {
    updateClaimDescription(input: $input) {
      project_media {
        id
        explainers(first: 100) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`;

const RemoveArticleWrapperButton = ({ disabled, children }) => {
  if (disabled) {
    return (
      <Tooltip
        key="remove-article-button"
        placement="top"
        title={
          <FormattedMessage
            id="removedArticleButton.tooltip"
            defaultMessage="You can't remove this article."
            description="Tooltip message displayed on remove article button when it is disabled."
          />
        }
        arrow
      >
        <div className="remove-article-button__tooltip-children">
          {children}
        </div>
      </Tooltip>
    );
  }

  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
};

const RemoveArticleButton = ({ team, disabled, buttonMainProps }) => {
  const [openDialog, setOpenDialog] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);

  const onCancel = () => {
    setOpenDialog(false);
  }

  const onProceed = () => {
    if (!removing) {
      setRemoving(true);
      let input = null;
      let mutation = null;
      if (nodeType === 'Explainer') {
        mutation = removeExplainerMutation;
        input = {
          explainerId: id,
          projectMediaId: projectMedia.dbid,
        };
      } else if (nodeType === 'FactCheck') {
        mutation = removeFactCheckMutation;
        input = {
          id,
          project_media_id: projectMedia.dbid,
        };
      }
      commitMutation(Relay.Store, {
        mutation,
        variables: {
          input,
        },
        onCompleted,
        onError,
      });
    }
  }

  return (
    <>
      <RemoveArticleWrapperButton>
        <CancelFillIcon />
      </RemoveArticleWrapperButton>
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
            defaultMessage="This article will no longer be associated with this media item but remain in your workspace."
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
};

RemoveArticleButton.propTypes = {
  team: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  project_media_id: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired,
};

export default RemoveArticleButton;
