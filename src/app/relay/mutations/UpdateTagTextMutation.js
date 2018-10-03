import Relay from 'react-relay/classic';

class UpdateTagTextMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation updateTagText {
      updateTagText
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on UpdateTagTextPayload {
        team {
          id
          custom_tags
          teamwide_tags
        }
      }
    `;
  }

  getVariables() {
    return this.props.tagText;
  }

  getConfigs() {
    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          team: this.props.team.id,
        },
      },
    ];
  }
}

export default UpdateTagTextMutation;
