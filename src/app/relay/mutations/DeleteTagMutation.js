import Relay from 'react-relay/classic';

class DeleteTagMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation destroyTag {
      destroyTag
    }`;
  }

  static fragments = {
    tag: () => Relay.QL`fragment on Tag { id }`,
  };

  getVariables() {
    return { id: this.props.id };
  }

  getFatQuery() {
    switch (this.props.parent_type) {
    case 'source':
      return Relay.QL`fragment on DestroyTagPayload { deletedId, source { id } }`;
    case 'project_media':
      return Relay.QL`fragment on DestroyTagPayload { deletedId, project_media { log, tags, log_count } }`;
    default:
      return '';
    }
  }

  getOptimisticResponse() {
    return { deletedId: this.props.id };
  }

  getConfigs() {
    const fieldIds = {};
    fieldIds[this.props.parent_type] = this.props.annotated.id;

    return [
      {
        type: 'FIELDS_CHANGE',
        fieldIDs: fieldIds,
      },
      {
        type: 'NODE_DELETE',
        parentName: this.props.parent_type,
        parentID: this.props.annotated.id,
        connectionName: 'tags',
        deletedIDFieldName: 'deletedId',
      },
    ];
  }
}

const deleteTag = (obj, onSuccess, onFailure) => {
  const { media, tagId } = obj;

  const annotated = media;
  const parent_type = 'project_media';

  Relay.Store.commitUpdate(
    new DeleteTagMutation({
      annotated,
      parent_type,
      id: tagId,
    }),
    { onSuccess, onFailure },
  );
};

export { deleteTag }; // eslint-disable-line import/prefer-default-export
