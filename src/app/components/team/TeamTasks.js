import React from 'react';
import Relay from 'react-relay/classic';
import { QueryRenderer, graphql } from 'react-relay/compat';
import TeamTaskCardForm from './TeamTaskCardForm'; // eslint-disable-line no-unused-vars
import TeamTasksRender from './TeamTasksRender';
import TeamMetadataRender from './TeamMetadataRender';
import { ContentColumn } from '../../styles/js/shared';

const TeamTasksComponent = ({ team, fieldset, about }) => {
  const isTask = fieldset === 'tasks';

  return (
    <div className="team-tasks">
      <ContentColumn large>
        { isTask ?
          <TeamTasksRender
            team={team}
            about={about}
          /> :
          <TeamMetadataRender
            team={team}
            about={about}
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
          about {
            ...TeamTaskCardForm_about
          }
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
                  conditional_info
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
          return <TeamTasksComponent about={props.about} team={props.team} fieldset={fieldset} />;
        }

        // TODO: We need a better error handling in the future, standardized with other components
        return null;
      }}
    />
  );
};

export default TeamTasks;
export { TeamTasksComponent };
