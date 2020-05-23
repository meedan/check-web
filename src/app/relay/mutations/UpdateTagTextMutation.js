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
          tag_texts
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
