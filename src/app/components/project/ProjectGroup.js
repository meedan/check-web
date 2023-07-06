/* eslint-disable relay/unused-fields */
import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import ErrorBoundary from '../error/ErrorBoundary';
import Search from '../search/Search';
import { safelyParseJSON } from '../../helpers';
import ProjectActions from '../drawer/Projects/ProjectActions';
import FolderSpecialIcon from '../../icons/folder_special.svg';

const ProjectGroup = ({ routeParams }) => (
  <ErrorBoundary component="ProjectGroup">
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query ProjectGroupQuery($id: ID!) {
          project_group(id: $id) {
            id
            dbid
            title
            team {
              id
              slug
              permissions
            }
          }
        }
      `}
      variables={{
        id: routeParams.projectGroupId,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          const query = {
            ...safelyParseJSON(routeParams.query, {}),
            project_group_id: [props.project_group.dbid],
          };

          return (
            <div className="project-group search-results-wrapper">
              <Search
                searchUrlPrefix={`/${routeParams.team}/collection/${routeParams.projectGroupId}`}
                mediaUrlPrefix={`/${routeParams.team}/media`}
                icon={<FolderSpecialIcon />}
                title={props.project_group.title}
                listActions={
                  <ProjectActions
                    object={props.project_group}
                    objectType="ProjectGroup"
                    name={<FormattedMessage id="projectGroup.name" defaultMessage="collection" description="A placeholder that appears if for some reason a collection lacks a name. This should never appear to the user, but please localize it just in case." />}
                    updateMutation={graphql`
                      mutation ProjectGroupUpdateProjectGroupMutation($input: UpdateProjectGroupInput!) {
                        updateProjectGroup(input: $input) {
                          project_group {
                            id
                            title
                          }
                        }
                      }
                    `}
                    deleteMessage={
                      <FormattedMessage
                        id="projectGroup.deleteMessage"
                        defaultMessage="If you delete this collection, all folders will still be accessible outside of the collection."
                        description="A message that appears when a user attempts to delete a collection to warn them that any folders inside will NOT be deleted, and will still be accessible."
                      />
                    }
                    deleteMutation={graphql`
                      mutation ProjectGroupDestroyProjectGroupMutation($input: DestroyProjectGroupInput!) {
                        destroyProjectGroup(input: $input) {
                          deletedId
                          team {
                            id
                            projects(first: 10000) {
                              edges {
                                node {
                                  id
                                  dbid
                                  title
                                  medias_count
                                  project_group_id
                                }
                              }
                            }
                          }
                        }
                      }
                    `}
                  />
                }
                teamSlug={routeParams.team}
                projectGroup={props.project_group}
                query={query}
                hideFields={['feed_fact_checked_by', 'project_group_id', 'cluster_teams', 'cluster_published_reports']}
                page="collection"
              />
            </div>
          );
        }
        return null;
      }}
    />
  </ErrorBoundary>
);

ProjectGroup.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    projectGroupId: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export default ProjectGroup;
