import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import TeamTasksRender from './TeamTasksRender';
import TeamMetadataRender from './TeamMetadataRender';
import { ContentColumn } from '../../styles/js/shared';

const TeamTasksComponent = ({ team, fieldset }) => {
  const isTask = fieldset === 'tasks';

  return (
    <div className="team-tasks">
      <ContentColumn large>
        { isTask ?
          <TeamTasksRender
            team={team}
          /> :
          <TeamMetadataRender
            team={team}
          />
        }
      </ContentColumn>
    </div>
  );
};

const TeamTasks = ({ team, fieldset }) => {
  const { slug } = team;

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query TeamTasksQuery($slug: String!, $fieldset: String!) {
          team(slug: $slug) {
            id
            dbid
            team_tasks(fieldset: $fieldset, first: 10000) {
              edges {
                node {
                  id
                  dbid
                  label
                  description
                  options
                  type
                  associated_type
                  project_ids
                  json_schema
                  show_in_browser_extension
                  required
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
        fieldset,
      }}
      render={({ error, props }) => {
        if (!error && props) {
          return <TeamTasksComponent team={props.team} fieldset={fieldset} />;
        }

        // TODO: We need a better error handling in the future, standardized with other components
        return null;
      }}
    />
  );
};

export default TeamTasks;
export { TeamTasksComponent };
