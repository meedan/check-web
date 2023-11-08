/* eslint-disable relay/unused-fields */
import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import TeamTaskCardForm from './TeamTaskCardForm'; // eslint-disable-line no-unused-vars
import TeamMetadataRender from './TeamMetadataRender';

const TeamTasksComponent = ({ team, about }) => (
  <div className="team-tasks">
    <TeamMetadataRender
      team={team}
      about={about}
    />
  </div>
);

const TeamTasks = ({ team }) => {
  const { slug } = team;

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query TeamTasksQuery($slug: String!) {
          about {
            file_max_size
            file_extensions
          }
          team(slug: $slug) {
            id
            dbid
            slug
            team_tasks(fieldset: "metadata", first: 10000) {
              edges {
                node {
                  id
                  dbid
                  label
                  description
                  options
                  type
                  associated_type
                  json_schema
                  show_in_browser_extension
                  required
                  conditional_info
                  tasks_count
                }
              }
            }
            projects(first: 10000) {
              edges {
                node {
                  title,
                  dbid,
                  id,
                  medias_count,
                }
              }
            }
          }
        }
      `}
      variables={{
        slug,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          return <TeamTasksComponent about={props.about} team={props.team} />;
        }

        // TODO: We need a better error handling in the future, standardized with other components
        return null;
      }}
    />
  );
};

export default TeamTasks;
export { TeamTasksComponent };
