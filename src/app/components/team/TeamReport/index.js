/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import TeamReportComponent from './TeamReportComponent';

const TeamReport = () => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];

  return (
    <QueryRenderer
      environment={Relay.Store}
      query={graphql`
        query TeamReportQuery($teamSlug: String!) {
          team(slug: $teamSlug) {
            id
            permissions
            get_report
            get_language
            get_languages
            smooch_bot: team_bot_installation(bot_identifier: "smooch") {
              id
            }
          }
        }
      `}
      render={({ props }) => {
        if (props) {
          return (<TeamReportComponent team={props.team} />);
        }
        return null;
      }}
      variables={{
        teamSlug,
      }}
    />
  );
};

TeamReport.propTypes = {};

export default TeamReport;
