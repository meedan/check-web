import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import ProjectsComponent from './ProjectsComponent';

const renderQuery = ({ error, props }) => {
  if (!error && props) {
    return (
      <ProjectsComponent
        team={props.team}
        projects={props.team.projects.edges.map(p => p.node)}
        projectGroups={props.team.project_groups.edges.map(pg => pg.node)}
        savedSearches={props.team.saved_searches.edges.map(ss => ss.node)}
      />
    );
  }

  // TODO: We need a better error handling in the future, standardized with other components
  return null;
};

const Projects = () => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];

  // Not in a team context
  if (teamSlug === 'check') {
    return null;
  }

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query ProjectsQuery($teamSlug: String!) {
          team(slug: $teamSlug) {
            id
            dbid
            slug
            name
            medias_count
            permissions
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
            project_groups(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  title
                  medias_count
                }
              }
            }
            saved_searches(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  title
                  filters
                }
              }
            }
          }
        }
      `}
      variables={{
        teamSlug,
      }}
      render={renderQuery}
    />
  );
};

export default Projects;
