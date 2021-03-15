import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import SlackConfigDialogComponent from './SlackConfigDialogComponent';

const SlackConfigDialog = ({ teamSlug, onCancel }) => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SlackConfigDialogQuery($teamSlug: String!) {
        team(slug: $teamSlug) {
          ...SlackConfigDialogComponent_team
        }
      }
    `}
    variables={{
      teamSlug,
    }}
    render={({ props }) => {
      if (props) {
        return (<SlackConfigDialogComponent team={props.team} onCancel={onCancel} />);
      }
      return null;
    }}
  />
);

SlackConfigDialog.propTypes = {
  teamSlug: PropTypes.string.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default SlackConfigDialog;
