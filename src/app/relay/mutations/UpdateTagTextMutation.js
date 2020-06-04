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
        tag_text,
        team {
          id
          tag_texts
        }
      }
    `;
  }

  getOptimisticResponse() {
    return {
      tag_text: this.props.tagText,
    };
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
          tag_text: this.props.tagText.id,
        },
      },
    ];
  }
}

export default UpdateTagTextMutation;
