import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Relay from 'react-relay/classic';
import CreateMediaButton from './CreateMediaButton';
import createEnvironment from '../../../relay/EnvironmentModern';

const CreateMedia = () =>
  (<QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query CreateMediaQuery {
        me {
          token
        }
        team {
          slug
          ...CreateMediaButton_team
        }
      }
    `}
    render={({ props }) => {
      if (props) {
        const environment = createEnvironment(props?.me?.token, props?.team?.slug);
        return (
          <CreateMediaButton environment={environment} team={props.team} />
        );
      }
      return null;
    }}
  />
  );
export default CreateMedia;
