import React from 'react';
import PropTypes from 'prop-types';
import { commitMutation, createFragmentContainer, graphql } from 'react-relay/compat';
import { browserHistory } from 'react-router';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import { FlashMessageSetterContext } from '../FlashMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';

function commitAddProjectMediaToProject({
  projectMedia, project, onSuccess, onFailure,
}) {
  return commitMutation(Relay.Store, {
    mutation: graphql`
      mutation RemoveProjectMediaFromProjectActionMutation($input: DestroyProjectMediaProjectInput!) {
        destroyProjectMediaProject(input: $input) {
          project_media {
            id
            project_ids
          }
          project {
            id
            medias_count
            search {
              id
              number_of_results
              # medias
            }
          }
        }
      }
    `,
    optimisticResponse: {
      destroyProjectMediaProject: {
        project_media: {
          id: projectMedia.id,
          project_ids: projectMedia.project_ids.filter(i => i !== project.dbid),
        },
        project: {
          id: project.id,
          medias_count: project.medias_count - 1,
          search: {
            id: project.search_id,
            number_of_results: project.medias_count - 1,
          },
        },
      },
    },
    variables: {
      input: {
        project_media_id: projectMedia.dbid,
        project_id: project.dbid,
      },
    },
    onError: onFailure,
    onCompleted: ({ data, errors }) => {
      if (errors) {
        return onFailure(errors);
      }
      return onSuccess(data);
    },
  });
}

function RemoveProjectMediaFromProjectAction({
  team, projectMedia, project, className,
}) {
  const [isSaving, setIsSaving] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const handleClick = React.useCallback(() => {
    setIsSaving(true);
    commitAddProjectMediaToProject({
      projectMedia,
      project,
      onSuccess: () => {
        setIsSaving(false);
        const message = (
          <FormattedMessage
            id="mediaActionsBar.removedFromList"
            defaultMessage="Removed from list"
          />
        );
        setFlashMessage(message);
        browserHistory.push(`/${team.slug}/media/${projectMedia.dbid}`);
      },
      onFailure: (errors) => {
        setIsSaving(false);
        console.error(errors); // eslint-disable-line no-console
        setFlashMessage((
          getErrorMessageForRelayModernProblem(errors)
          || <GenericUnknownErrorMessage />
        ));
      },
    });
  }, [
    setFlashMessage, team, projectMedia, project, setIsSaving,
  ]);

  return (
    <Button
      id="media-actions-bar__remove-from-list"
      variant="outlined"
      className={className}
      endIcon={isSaving ? <CircularProgress color="inherit" size="1em" /> : null}
      color="primary"
      onClick={handleClick}
    >
      <FormattedMessage id="mediaActionsBar.removeFromList" defaultMessage="Remove from list" />
    </Button>
  );
}
RemoveProjectMediaFromProjectAction.propTypes = {
  className: PropTypes.string.isRequired,
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
  projectMedia: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    project_ids: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
  }).isRequired,
  project: PropTypes.shape({
    id: PropTypes.string.isRequired,
    dbid: PropTypes.number.isRequired,
    medias_count: PropTypes.number.isRequired,
    search_id: PropTypes.string.isRequired,
  }).isRequired,
};

export default createFragmentContainer(RemoveProjectMediaFromProjectAction, {
  team: graphql`
    fragment RemoveProjectMediaFromProjectAction_team on Team {
      slug
    }
  `,
  projectMedia: graphql`
    fragment RemoveProjectMediaFromProjectAction_projectMedia on ProjectMedia {
      id
      dbid
      project_ids
    }
  `,
  project: graphql`
    fragment RemoveProjectMediaFromProjectAction_project on Project {
      id
      dbid
      medias_count
      search_id
    }
  `,
});
