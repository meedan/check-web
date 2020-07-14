import Relay from 'react-relay/classic';

class BulkCreateProjectMediaProjectsMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createProjectMediaProjects {
      createProjectMediaProjects
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateProjectMediaProjectsMutationPayload {
       enqueued
      }
    `;
  }

  getOptimisticResponse() {
    return {
      project: {
        id: this.props.project.id,
        medias_count: this.props.project.medias_count + this.props.projectMedias.length,
      },
    };
  }

  getVariables() {
    const vars = [];
    this.props.projectMedias.forEach((projectMedia) => {
      vars.push({ project_media_id: projectMedia, project_id: this.props.project.dbid });
    });
    return { inputs: vars };
  }

  getConfigs() {
    return [];
  }
}

export default BulkCreateProjectMediaProjectsMutation;
