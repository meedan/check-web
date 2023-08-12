/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import MultiSelector from '../layout/MultiSelector';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import globalStrings from '../../globalStrings';
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
          id="bulkActionsRemoveTag.success"
          defaultMessage="{tags} tags removed from {itemsCount} items"
          values={{
            tags: selectedValueText,
            itemsCount: selectedMedia.length,
          }}
          description="Success message for bulk untagging items"
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
              list_columns_values
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
      onCompleted: ({ response, error }) => {
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
      <FormattedMessage id="tagMenu.search" defaultMessage="Search…" description="Search in tags list">
        {placeholder => (
          <MultiSelector
            allowSearch
            cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
            inputPlaceholder={placeholder}
            selected={[]}
            onDismiss={onDismiss}
            options={options}
            onSubmit={handleRemoveTag}
            onSelectChange={handleSelectChange}
            notFoundLabel={
              <FormattedMessage
                id="tagMenu.notFound"
                defaultMessage="No tags found"
                description="Text to display if no tags found"
              />
            }
            submitLabel={
              <FormattedMessage
                id="bulkActionsRemoveTag.submitLabel"
                defaultMessage="{numItems, plural, one {Remove 1 tag} other {Remove # tags}}"
                values={{ numItems: selectedValue.length }}
                description="Button for commiting the action of untagging of a number of items in bulk"
              />
            }
          />
        )}
      </FormattedMessage>
      <ConfirmProceedDialog
        open={showDialog}
        title={
          <FormattedMessage
            id="bulkActionsRemoveTag.dialogTitle"
            defaultMessage="Tags will be removed from eligible items"
            description="Title of dialog warning after bulk untagging items"
          />
        }
        body={
          <Typography variant="body1" component="p" paragraph>
            <FormattedHTMLMessage
              id="bulkActionsRemoveTag.dialogBody"
              defaultMessage="The <b>{tags}</b> tag will be removed from selected items that have this tag. if a tag is not found in a selected item, the item will be unaffected.<br /><br /><b>This action cannot be undone.</b> Are you sure you want to continue?"
              values={{
                tags: selectedValueText,
              }}
              description="Body of dialog warning that bulk untagging items"
            />
          </Typography>
        }
        onProceed={handleSubmit}
        onCancel={handleOnCancel}
        proceedLabel={
          <FormattedMessage
            id="bulkActionsRemoveTag.proceedLabel"
            defaultMessage="Remove tags"
            description="Button to confirm remove tags"
          />
        }
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
