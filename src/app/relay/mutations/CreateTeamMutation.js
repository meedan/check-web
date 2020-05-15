import Relay from 'react-relay/classic';

class CreateTeamMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createTeam {
      createTeam
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateTeamPayload {
        user {
          team_users
        }
        team_userEdge
        team
      }
    `;
  }

  getVariables() {
    return { name: this.props.name, description: this.props.description, slug: this.props.slug };
  }

  getConfigs() {
    return [{
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on CreateTeamPayload {
          team {
            id,
            name,
            dbid,
            slug,
            description,
          },
          user {
            user_teams
          }
        }`,
      ],
    },
    {
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        user: this.props.user.id,
      },
    },
    {
      type: 'RANGE_ADD',
      parentName: 'user',
      parentID: this.props.user.id,
      connectionName: 'team_users',
      edgeName: 'team_userEdge',
      rangeBehaviors: () => ('append'),
    }];
  }
}

export default CreateTeamMutation;
