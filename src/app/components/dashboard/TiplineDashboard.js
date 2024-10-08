import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import TiplineDataComponent from './TiplineDataComponent';

const TiplineDashboard = team => (
  <div>
    <TiplineDataComponent
      data={team.data_report}
      defaultLanguage={team.get_language}
      slug={team.slug}
    />
  </div>
);

const TiplineDashboardQueryRenderer = ({ teamSlug }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query TiplineDashboardQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          slug
          get_language
          data_report
        }
      }
    `}
    render={({ error, props }) => {
      if (!error && props) {
        const { team } = props;

        return (<TiplineDashboard team={team} />);
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return null;
    }}
    variables={{ teamSlug }}
  />
);

TiplineDashboardQueryRenderer.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default TiplineDashboardQueryRenderer;
