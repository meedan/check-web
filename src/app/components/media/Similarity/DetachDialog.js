import React from 'react';
import { FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import SelectProjectDialog from '../SelectProjectDialog';

const DetachDialog = ({ closeDialog, handleDelete }) => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query DetachDialogQuery($teamSlug: String!) {
          team(slug: $teamSlug) {
            name
            projects(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  title
                }
              }
            }
          }
        }
      `}
      variables={{
        teamSlug,
      }}
      render={({ props }) => {
        if (props) {
          return (
            <SelectProjectDialog
              open
              team={props.team}
              excludeProjectDbids={[]}
              title={
                <FormattedMessage
                  id="mediaItem.dialogdetachedToListTitle"
                  defaultMessage="Move detached item to…"
                  description="Dialog title prompting user to select a destination list for the item"
                />
              }
              cancelLabel={
                <FormattedMessage
                  id="mediaItem.cancelButton"
                  defaultMessage="Cancel"
                  description="Button to dismiss the dialog"
                />
              }
              submitLabel={
                <FormattedMessage
                  id="mediaItem.detached"
                  defaultMessage="Move to list"
                  description="Button to commit the action of moving item"
                />
              }
              submitButtonClassName="media-item__add-button"
              onCancel={closeDialog}
              onSubmit={handleDelete}
            />
          );
        }
        return null;
      }}
    />
  );
};

DetachDialog.propTypes = {};

export default DetachDialog;
