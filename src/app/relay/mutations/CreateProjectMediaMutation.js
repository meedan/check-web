import Relay from 'react-relay/classic';
import optimisticProjectMedia from './optimisticProjectMedia';

class CreateProjectMediaMutation extends Relay.Mutation {
  getMutation() {
    return Relay.QL`mutation createProjectMedia {
      createProjectMedia
    }`;
  }

  getFatQuery() {
    return Relay.QL`
      fragment on CreateProjectMediaPayload {
        project_mediaEdge,
        project_media,
        related_to { id, relationships, log, log_count },
        relationships_target { id },
        relationships_source { id },
        team { id, medias_count },
        check_search_team { id, number_of_results },
        check_search_project { id, number_of_results }
      }
    `;
  }

  getOptimisticResponse() {
    const optimisticResponse =
      optimisticProjectMedia(
        this.props.title,
        this.props.project,
        { team: this.props.team }, // context -- TODO nix context argument
        this.props.team,
      );

    if (this.props.search && this.props.project) {
      optimisticResponse.check_search_project = {
        id: this.props.project.search_id,
        number_of_results: this.props.search.number_of_results + 1,
      };
    }

    return optimisticResponse;
  }

  getVariables() {
    const vars = {
      media_type: this.props.mediaType,
      url: this.props.url,
      quote: this.props.quote,
      quote_attributions: this.props.quoteAttributions,
      add_to_project_id: this.props.project ? this.props.project.dbid : null,
    };
    if (this.props.related_to_id) {
      vars.related_to_id = this.props.related_to_id;
    }
    return vars;
  }

  getFiles() {
    const { image, video } = this.props;
    const file = this.props.mode === 'image' ? image : video;
    return { file };
  }

  getConfigs() {
    const configs = [];
    const fieldIDs = {};
    if (!this.props.related && !this.props.related_to_id &&
    (this.props.team || this.props.project)) {
      configs.push({
        type: 'RANGE_ADD',
        parentName: 'check_search_team',
        parentID: this.props.team ? this.props.team.search_id : this.props.project.team.search_id,
        connectionName: 'medias',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: () => ('prepend'),
      });
      fieldIDs.check_search_team = this.props.team ?
        this.props.team.search_id :
        this.props.project.team.search_id;
      fieldIDs.team = this.props.team ?
        this.props.team.id :
        this.props.project.team.id;
    }
    if (!this.props.related && !this.props.related_to_id && this.props.project) {
      configs.push({
        type: 'RANGE_ADD',
        parentName: 'check_search_project',
        parentID: this.props.project.search_id,
        connectionName: 'medias',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: () => ('prepend'),
      });
      fieldIDs.check_search_project = this.props.project.search_id;
    }
    configs.push({
      type: 'FIELDS_CHANGE',
      fieldIDs,
    });
    configs.push({
      type: 'REQUIRED_CHILDREN',
      children: [Relay.QL`
        fragment on CreateProjectMediaPayload {
          project_media {
            dbid
            title
          },
          check_search_team {
            id
          },
          check_search_project {
            id
          }
        }`,
      ],
    });

    if (this.props.related_to_id) {
      if (this.props.targets_count > 0) {
        configs.push({
          type: 'RANGE_ADD',
          parentName: 'relationships_target',
          parentID: this.props.relationships_target_id,
          connectionName: 'targets',
          edgeName: 'project_mediaEdge',
          rangeBehaviors: () => ('prepend'),
        });
        configs.push({
          type: 'RANGE_ADD',
          parentName: 'relationships_source',
          parentID: this.props.relationships_source_id,
          connectionName: 'siblings',
          edgeName: 'project_mediaEdge',
          rangeBehaviors: () => ('prepend'),
        });
      }
      configs.push({
        type: 'FIELDS_CHANGE',
        fieldIDs: {
          related_to: this.props.related.id,
        },
      });
    }

    return configs;
  }
}

export default CreateProjectMediaMutation;
