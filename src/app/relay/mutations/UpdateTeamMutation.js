import Relay from 'react-relay';

class UpdateTeamMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateTeam {
      updateTeam
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateTeamPayload {
        check_search_team { id },
        team {
          name
          id
          description
          contacts
          avatar
        }
        public_team {
          avatar
          name
          description
        }
      }
    `;
  }

  getVariables() {
    return {
      id: this.props.id,
      name: this.props.name,
      description: this.props.description,
      empty_trash: this.props.empty_trash,
      contact: this.props.contact,
    };
  }

  getFiles() {
    return {
      file: this.props.avatar,
    };
  }

  getConfigs() {
    return [
      {
        type: 'REQUIRED_CHILDREN',
        children: [Relay.QL`
          fragment on UpdateTeamPayload {
            team {
              name, id, description, avatar,
              contacts(first: 1) { edges { node { web, location, phone } } }
            }
          }`,
        ],
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: { team: this.props.id, public_team: this.props.public_id },
      },
      {
        type: 'NODE_DELETE',
        parentName: 'check_search_team',
        parentID: this.props.search_id,
        connectionName: 'medias',
        deletedIDFieldName: 'affectedIds',
      },
    ];
  }
}
export default UpdateTeamMutation;
