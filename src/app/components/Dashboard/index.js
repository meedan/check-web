/* eslint-disable relay/unused-fields */
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import TiplineDataComponent from './TiplineDataComponent';

const renderQuery = ({ error, props }) => {
  if (!error && props) {
    const { team } = props;
    return (
      <TiplineDataComponent
        data={team.data_report}
        defaultLanguage={team.get_language}
        slug={team.slug}
      />
    );
  }

  // TODO: We need a better error handling in the future, standardized with other components
  return null;
};

const TeamData = props => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query DashboardQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          id
          slug
          get_language
          data_report
        }
      }
    `}
    render={renderQuery}
    variables={{
      teamSlug: props.teamSlug,
    }}
  />
);

TeamData.propTypes = {
  teamSlug: PropTypes.string.isRequired,
};

export default TeamData;
