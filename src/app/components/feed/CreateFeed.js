import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import SaveFeed from './SaveFeed';

const CreateFeed = () => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query CreateFeedQuery {
        team {
          permissions
        }
      }
    `}
    render={({ error, props }) => {
      if (!error && props) {
        return (<SaveFeed permissions={JSON.parse(props.team.permissions)} />);
      }
      return null;
    }}
  />
);

export default CreateFeed;
