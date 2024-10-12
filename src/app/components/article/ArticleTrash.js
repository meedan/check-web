import React from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { graphql, createFragmentContainer, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import Alert from '../cds/alerts-and-prompts/Alert';
import ExternalLink from '../ExternalLink';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import { FlashMessageSetterContext } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import TrashIcon from '../../icons/delete.svg';
import UndoIcon from '../../icons/undo.svg';

const updateExplainer = graphql`
  mutation ArticleTrashExplainerMutation($input: UpdateExplainerInput!) {
    updateExplainer(input: $input) {
      explainer {
        id
        trashed
      }
      team {
        explainerCount: articles_count(article_type: "explainer")
        trashCount: articles_count(trashed: true)
      }
    }
  }
`;

const updateFactCheck = graphql`
  mutation ArticleTrashFactCheckMutation($input: UpdateFactCheckInput!) {
    updateFactCheck(input: $input) {
      fact_check {
        id
        trashed
      }
      team {
        factChecksCount: articles_count(article_type: "fact-check")
        publishedCount: articles_count(article_type: "fact-check", report_status: "published")
        importedCount: articles_count(article_type: "fact-check", imported: true)
        trashCount: articles_count(trashed: true)
      }
    }
  }
`;

const deletionWarning = (<FormattedMessage
  defaultMessage="It can be removed from the Trash later, but it will be deleted permanently after 30 days."
  description="Warning message indicating the article will be deleted permanently after 30 days"
  id="articleTrash.deletionWarning"
  tagName="p"
/>);

const associationWarning = (<FormattedMessage
  defaultMessage="Are you sure? If you send this article to the trash it will no longer be available to be associated with media responses."
  description="Warning message confirming the article will no longer be able to be associated with media items"
  id="articleTrash.associationWarning"
  tagName="p"
/>);

const deletionWarningExplainer = (<FormattedMessage
  defaultMessage="It can be linked again if the article is removed from the Trash. After 30 days, this article will be permanently deleted."
  description="Warning message indicating the explainer article will be deleted permanently after 30 days"
  id="articleTrash.deletionWarningExplainer"
  tagName="p"
/>);

const ArticleTrash = ({
  article,
  onClose,
  type,
}) => {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const buttonLabel = article.trashed ? (
    <FormattedMessage
      defaultMessage="Restore from Trash"
      description="Button label for restoring an article"
      id="articleTrash.restoreButton"
    />
  ) : (
    <FormattedMessage
      defaultMessage="Move to Trash"
      description="Button label for trashing an article"
      id="articleTrash.trashButton"
    />
  );

  const trashTitle = type === 'explainer' ? (
    <FormattedMessage
      defaultMessage="Send Explainer to Trash?"
      description="Title for the trash dialog for explainer articles"
      id="articleForm.explainerTrashTitle"
    />
  ) : (
    <FormattedMessage
      defaultMessage="Send Claim & Fact-Check to Trash?"
      description="Title for the trash dialog for fact-check articles"
      id="articleForm.factCheckTrashTitle"
    />
  );

  const factCheckBody = type === 'fact-check' && article.claim_description?.project_media && article.claim_description?.project_media?.type !== 'Blank' ? (
    <div>
      {associationWarning}
      {deletionWarning}
      <Alert
        content={
          <ul>
            <li>
              <ExternalLink
                maxUrlLength={50}
                title={article.claim_description?.project_media.title}
                url={article.claim_description?.project_media.full_url}
              />
            </li>
          </ul>
        }
        title={<FormattedMessage
          defaultMessage="Sending this article to the trash will unlink from the following media:"
          description="Title for the warning alert when deleting a fact-check not associated with a media item"
          id="articleTrash.associatedMediaWarning"
        />}
        variant="warning"
      />
    </div>
  ) : (
    <div>
      {associationWarning}
      {deletionWarning}
    </div>
  );

  const explainerBody = type === 'explainer' ? (
    <div>
      {associationWarning}
      <FormattedMessage
        defaultMessage="If this article is currently associated with media, the link between the media and article will be removed."
        description="Body message for deleting an explainer article"
        id="articleTrash.explainerBody"
        tagName="p"
      />
      {deletionWarningExplainer}
    </div>
  ) : null;

  const dialogBody = type === 'explainer' ? explainerBody : factCheckBody;

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const onFailure = (errors) => {
    const errorMessage = getErrorMessageForRelayModernProblem(errors) || <GenericUnknownErrorMessage />;
    setFlashMessage(errorMessage, 'error');
  };

  const onSuccess = (trashed) => {
    const message = trashed ? (
      <FormattedMessage
        defaultMessage="Moved article to trash"
        description="Success message displayed when an article is moved to trash"
        id="articleTrash.successTrashed"
      />
    ) : (
      <FormattedMessage
        defaultMessage="Article moved from trash"
        description="Success message displayed when an article is moved from the trash"
        id="articleTrash.successRestored"
      />
    );
    setFlashMessage(message, 'success');
    onClose();
    handleDialogClose();
    browserHistory.push(`${window.location.pathname}?reload=true`);
  };

  const handleProceed = () => {
    setSaving(true);
    if (type === 'explainer') {
      commitMutation(Relay.Store, {
        mutation: updateExplainer,
        variables: {
          input: {
            id: article.id,
            trashed: !article.trashed,
          },
        },
        onCompleted: (response, err) => {
          setSaving(false);
          if (err) {
            onFailure(err);
          } else {
            onSuccess(response.updateExplainer.explainer.trashed);
          }
        },
        onError: (err) => {
          onFailure(err);
        },
      });
    } else if (type === 'fact-check') {
      commitMutation(Relay.Store, {
        mutation: updateFactCheck,
        variables: {
          input: {
            id: article.id,
            trashed: !article.trashed,
          },
        },
        onCompleted: (response, err) => {
          setSaving(false);
          if (err) {
            onFailure(err);
          } else {
            onSuccess(response.updateFactCheck.fact_check.trashed);
          }
        },
        onError: (err) => {
          onFailure(err);
        },
      });
    }
  };

  const handleTrashClick = () => {
    if (article.trashed) {
      handleProceed();
    } else {
      setIsDialogOpen(true);
    }
  };


  return (
    <>
      <ButtonMain
        buttonProps={{
          id: 'article-trash-button',
        }}
        disabled={saving}
        iconLeft={article.trashed ? <UndoIcon /> : <TrashIcon />}
        label={buttonLabel}
        theme={article.trashed ? 'info' : 'error'}
        onClick={handleTrashClick}
      />
      {isDialogOpen && (
        <ConfirmProceedDialog
          body={dialogBody}
          open={isDialogOpen}
          proceedLabel={<FormattedMessage
            defaultMessage="Move to Trash"
            description="Label for the proceed button in the trash dialog"
            id="articleTrash.proceedLabel"
          />}
          title={trashTitle}
          onCancel={handleDialogClose}
          onProceed={handleProceed}
        />
      )}
    </>
  );
};

ArticleTrash.propTypes = {
  article: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
};

export default createFragmentContainer(ArticleTrash, graphql`
  fragment ArticleTrash_article on Node {
    ... on FactCheck {
      id
      trashed
      claim_description {
        project_media {
          title
          full_url
          type
        }
      }
    }
    ... on Explainer {
      id
      trashed
    }
  }
`);
