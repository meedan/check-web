import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import SaveFeed from './SaveFeed';
import { safelyParseJSON } from '../../helpers';

const CreateFeed = () => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query CreateFeedQuery {
        team {
          name
          permissions
        }
      }
    `}
    render={({ error, props }) => {
      if (!error && props) {
        return (<SaveFeed permissions={safelyParseJSON(props.team.permissions)} teamName={props.team.name} />);
      }
      return null;
    }}
  />
);

export default CreateFeed;
