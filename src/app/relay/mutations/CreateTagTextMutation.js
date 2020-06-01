import Relay from 'react-relay/classic';

class CreateTagTextMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createTagText {
      createTagText
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateTagTextPayload {
        tag_textEdge
        tag_text
        team {
          id
        }
      }
    `;
  }

  getVariables() {
    return { team_id: this.props.team.dbid, text: this.props.text };
  }

  getOptimisticResponse() {
    return {
      tag_textEdge: {
        node: {
          id: 'VGFnVGV4dC8w\n',
          dbid: 0,
          text: this.props.text,
          tags_count: 0,
          created_at: new Date().toString(),
          permissions: '{"read TagText":true,"update TagText":false,"destroy TagText":false}',
        },
      },
      team: {
        id: this.props.team.id,
      },
    };
  }

  getConfigs() {
    return [
      {
        type: 'RANGE_ADD',
        parentName: 'team',
        parentID: this.props.team.id,
        connectionName: 'tag_texts',
        edgeName: 'tag_textEdge',
        rangeBehaviors: () => ('append'),
      },
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          team: this.props.team.id,
        },
      },
    ];
  }
}

export default CreateTagTextMutation;
