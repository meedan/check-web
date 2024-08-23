/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AddIcon from '../../icons/add.svg';
import MultiSelector from '../layout/MultiSelector';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';

const BulkActionsTag = ({
  onDismiss,
  selectedMedia,
  setFlashMessage,
  team,
}) => {
  const [searchValue, setSearchValue] = React.useState(null);
  const [selectedValue, setSelectedValue] = React.useState([]);
  const options = team.tag_texts.edges.map(tt => ({ label: tt.node.text, value: tt.node.text }));

  const onFailure = (error) => {
    const errorMessage = getErrorMessageForRelayModernProblem(error) || <GenericUnknownErrorMessage />;
    setFlashMessage(errorMessage, 'error');
    onDismiss();
  };

  const handleAddNew = (value) => {
    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation BulkActionsTagCreateTagTextMutation($input: CreateTagTextInput!) {
          createTagText(input: $input) {
            team {
              id
              tag_texts(first: 100) {
                edges {
                  node {
                    id
                    text
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        input: {
          team_id: team.dbid,
          text: value,
        },
      },
      onError: onFailure,
    });
  };

  const handleSelectChange = value => setSelectedValue(value);

  const actionButton = searchValue && !options.includes(searchValue) ? (
    <ButtonMain
      buttonProps={{
        id: 'bulk-actions-tag__create-button',
      }}
      iconLeft={<AddIcon />}
      label={
        <FormattedMessage defaultMessage="Create this tag" description="Button label for creating a new tag" id="tagMenu.create" />
      }
      size="default"
      theme="lightInfo"
      variant="contained"
      onClick={() => handleAddNew(searchValue)}
    />
  ) : null;

  const handleSubmit = (value) => {
    const onSuccess = () => {
      setFlashMessage((
        <FormattedMessage
          defaultMessage="Items tagged successfully"
          description="Success message for bulk tagging actions"
          id="bulkActionsTag.success"
        />
      ), 'success');
      onDismiss();
    };

    const inputs = [];

    value.forEach((v) => {
      selectedMedia.forEach((m) => {
        inputs.push({
          tag: v,
          annotated_type: 'ProjectMedia',
          annotated_id: `${m}`,
        });
      });
    });

    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation BulkActionsTagCreateTagsMutation($input: CreateTagsInput!) {
          createTags(input: $input) {
            check_search_team {
              medias(first: 50) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
            team {
              dbid
              tag_texts(first: 100) {
                edges {
                  node {
                    id
                    dbid
                    text
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        input: {
          inputs,
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

  return (
    <FormattedMessage defaultMessage="Search…" description="Placeholder text for searching tags" id="tagMenu.search">
      {placeholder => (
        <MultiSelector
          actionButton={actionButton}
          allowSearch
          cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />}
          inputPlaceholder={placeholder}
          notFoundLabel={
            <FormattedMessage
              defaultMessage="No tags found"
              description="Empty message when a search results in no tags"
              id="tagMenu.notFound"
            />
          }
          options={options}
          selected={[]}
          submitLabel={
            <FormattedMessage
              defaultMessage="{numItems, plural, one {Add 1 tag} other {Add # tags}}"
              description="Button for committing the action of tagging of a number of items in bulk"
              id="bulkActionsTag.submitLabel"
              values={{ numItems: selectedValue.length }}
            />
          }
          onDismiss={onDismiss}
          onSearchChange={value => setSearchValue(value)}
          onSelectChange={handleSelectChange}
          onSubmit={handleSubmit}
        />
      )}
    </FormattedMessage>
  );
};

BulkActionsTag.propTypes = {
  onDismiss: PropTypes.func.isRequired,
  selectedMedia: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  setFlashMessage: PropTypes.func.isRequired,
  team: PropTypes.shape({
    dbid: PropTypes.number.isRequired,
    tag_texts: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(withSetFlashMessage(BulkActionsTag), graphql`
  fragment BulkActionsTag_team on Team {
    dbid
    tag_texts(first: 100) {
      edges {
        node {
          text
        }
      }
    }
  }
`);
