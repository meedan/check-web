/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import MultiSelector from '../layout/MultiSelector';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import { getErrorMessageForRelayModernProblem } from '../../helpers';

const BulkActionsRemoveTag = ({
  onDismiss,
  selectedMedia,
  setFlashMessage,
  team,
}) => {
  const [selectedValue, setSelectedValue] = React.useState([]);
  const [selectedValueText, setSelectedValueText] = React.useState([]);
  const [showDialog, setShowDialog] = React.useState(false);
  const options = team.tag_texts.edges.map(tt => ({ label: tt.node.text, value: tt.node.dbid.toString() }));

  const handleSubmit = () => {
    const onFailure = (error) => {
      const errorMessage = getErrorMessageForRelayModernProblem(error) || <GenericUnknownErrorMessage />;
      setFlashMessage(errorMessage, 'error');
      onDismiss();
    };
    const onSuccess = () => {
      setFlashMessage((
        <FormattedMessage
          defaultMessage="{tags} tags removed from {itemsCount} items"
          description="Success message for bulk untagging items"
          id="bulkActionsRemoveTag.success"
          values={{
            tags: selectedValueText,
            itemsCount: selectedMedia.length,
          }}
        />
      ), 'success');
      onDismiss();
    };

    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation BulkActionsRemoveTagMutation($input: UpdateProjectMediasInput!) {
          updateProjectMedias(input: $input) {
            updated_objects {
              id
            }
          }
        }
      `,
      variables: {
        input: {
          ids: selectedMedia,
          action: 'remove_tags',
          params: JSON.stringify({
            tags_text: selectedValue.join(','),
          }),
        },
      },
      onCompleted: ({ error, response }) => {
        if (error) {
          return onFailure(error);
        }
        return onSuccess(response);
      },
      onError: onFailure,
    });
  };

  const handleSelectChange = (value) => {
    setSelectedValue(value);
    const tagTexts = team.tag_texts.edges.filter(tt => value.indexOf(tt.node.dbid.toString()) !== -1).map(tt => `"${tt.node.text}"`);
    const lastTag = tagTexts.pop();
    let displayTags = '';
    if (tagTexts.length) {
      displayTags = `${tagTexts.join(', ')} and ${lastTag}`;
    } else {
      displayTags = lastTag;
    }
    setSelectedValueText(displayTags);
  };

  const handleRemoveTag = () => setShowDialog(true);

  const handleOnCancel = () => {
    setShowDialog(false);
  };

  return (
    <React.Fragment>
      <FormattedMessage defaultMessage="Search…" description="Search in tags list" id="tagMenu.search">
        {placeholder => (
          <MultiSelector
            allowSearch
            cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />}
            inputPlaceholder={placeholder}
            notFoundLabel={
              <FormattedMessage
                defaultMessage="No tags found"
                description="Text to display if no tags found"
                id="tagMenu.notFound"
              />
            }
            options={options}
            selected={[]}
            submitLabel={
              <FormattedMessage
                defaultMessage="{numItems, plural, one {Remove # tag} other {Remove # tags}}"
                description="Button for commiting the action of untagging of a number of items in bulk"
                id="bulkActionsRemoveTag.submitLabel"
                values={{ numItems: selectedValue.length }}
              />
            }
            onDismiss={onDismiss}
            onSelectChange={handleSelectChange}
            onSubmit={handleRemoveTag}
          />
        )}
      </FormattedMessage>
      <ConfirmProceedDialog
        body={
          <FormattedHTMLMessage
            defaultMessage="The <strong>{tags}</strong> tags will be removed from selected items.<br /><br /><strong>This action cannot be undone.</strong> Are you sure you want to continue?"
            description="Body of dialog warning that bulk untagging items"
            id="bulkActionsRemoveTag.dialogBody"
            tagName="p"
            values={{
              tags: selectedValueText,
            }}
          />
        }
        open={showDialog}
        proceedLabel={
          <FormattedMessage
            defaultMessage="Remove tags"
            description="Button to confirm remove tags"
            id="bulkActionsRemoveTag.proceedLabel"
          />
        }
        title={
          <FormattedMessage
            defaultMessage="Tags will be removed from eligible items"
            description="Title of dialog warning after bulk untagging items"
            id="bulkActionsRemoveTag.dialogTitle"
          />
        }
        onCancel={handleOnCancel}
        onProceed={handleSubmit}
      />
    </React.Fragment>
  );
};

BulkActionsRemoveTag.propTypes = {
  onDismiss: PropTypes.func.isRequired,
  selectedMedia: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  setFlashMessage: PropTypes.func.isRequired,
  team: PropTypes.shape({
    tag_texts: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(withSetFlashMessage(BulkActionsRemoveTag), graphql`
  fragment BulkActionsRemoveTag_team on Team {
    tag_texts(first: 100) {
      edges {
        node {
          dbid
          text
        }
      }
    }
  }
`);
