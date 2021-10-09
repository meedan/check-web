import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import { MultiSelector } from '@meedan/check-ui';
import { withSetFlashMessage } from '../FlashMessage';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import globalStrings from '../../globalStrings';

const BulkActionsTag = ({
  onDismiss,
  selectedMedia,
  setFlashMessage,
  team,
}) => {
  const [searchValue, setSearchValue] = React.useState(null);
  const selected = [];
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
              tag_texts(first: 10000) {
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

  const actionButton = searchValue && !options.includes(searchValue) ? (
    <Button
      id="bulk-actions-tag__create-button"
      color="primary"
      onClick={() => handleAddNew(searchValue)}
    >
      <FormattedMessage id="tagMenu.create" defaultMessage="+ Create this tag" />
    </Button>
  ) : null;

  const handleSubmit = (value) => {
    const onSuccess = () => {
      setFlashMessage((
        <FormattedMessage
          id="bulkActionsTag.success"
          defaultMessage="Items tagged successfully"
          description="Success message for bulk tagging actions"
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
            team {
              dbid
              tag_texts(first: 10000) {
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
      onCompleted: ({ response, error }) => {
        if (error) {
          return onFailure(error);
        }
        return onSuccess(response);
      },
      onError: onFailure,
    });
  };

  return (
    <FormattedMessage id="tagMenu.search" defaultMessage="Search…">
      {placeholder => (
        <MultiSelector
          allowSearch
          actionButton={actionButton}
          cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
          inputPlaceholder={placeholder}
          selected={selected}
          onDismiss={onDismiss}
          onSearchChange={value => setSearchValue(value)}
          options={options}
          onSubmit={handleSubmit}
          notFoundLabel={
            <FormattedMessage
              id="tagMenu.notFound"
              defaultMessage="No tags found"
            />
          }
          submitLabel={
            <FormattedMessage
              id="bulkActionsTag.submitLabel"
              defaultMessage="{numItems, plural, one {Tag 1 item} other {Tag # items}}"
              values={{ numItems: selectedMedia.length }}
              description="Button for commiting the action of tagging of a number of items in bulk"
            />
          }
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
    tag_texts(first: 10000) {
      edges {
        node {
          text
        }
      }
    }
  }
`);
