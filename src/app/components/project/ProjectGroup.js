import React from 'react';
import PropTypes from 'prop-types';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import FolderSpecialIcon from '@material-ui/icons/FolderSpecial';
import Search from '../search/Search';
import { safelyParseJSON } from '../../helpers';
import ProjectActions from '../drawer/Projects/ProjectActions';

const ProjectGroup = ({ routeParams }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query ProjectGroupQuery($id: ID!) {
        project_group(id: $id) {
          id
          dbid
          title
          description
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
          <div className="project-group">
            <Search
              searchUrlPrefix={`/${routeParams.team}/collection/${routeParams.projectGroupId}`}
              mediaUrlPrefix={`/${routeParams.team}/media`}
              icon={<FolderSpecialIcon />}
              title={props.project_group.title}
              listDescription={props.project_group.description}
              listActions={
                <ProjectActions
                  object={props.project_group}
                  name={<FormattedMessage id="projectGroup.name" defaultMessage="collection" />}
                  updateMutation={graphql`
                    mutation ProjectGroupUpdateProjectGroupMutation($input: UpdateProjectGroupInput!) {
                      updateProjectGroup(input: $input) {
                        project_group {
                          id
                          title
                          description
                        }
                      }
                    }
                  `}
                  deleteMessage={
                    <FormattedMessage
                      id="projectGroup.deleteMessage"
                      defaultMessage="If you delete this collection, all folders will still be accessible, outside of the collection."
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
              hideFields={['project_group_id']}
              page="collection"
            />
          </div>
        );
      }
      return null;
    }}
  />
);

ProjectGroup.propTypes = {
  routeParams: PropTypes.shape({
    team: PropTypes.string.isRequired,
    projectGroupId: PropTypes.string.isRequired,
    query: PropTypes.string, // JSON-encoded value; can be empty/null/invalid
  }).isRequired,
};

export default ProjectGroup;
