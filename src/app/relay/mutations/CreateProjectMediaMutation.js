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
        project_media
        related_to {
          id
        }
        team { id, medias_count },
        check_search_team { id, number_of_results }
      }
    `;
  }

  getOptimisticResponse() {
    if (this.props.skipOptimisticResponse) return null;

    const optimisticResponse =
      optimisticProjectMedia(
        this.props.title,
        { team: this.props.team }, // context -- TODO nix context argument
        this.props.team,
      );

    return optimisticResponse;
  }

  getVariables() {
    const vars = {
      media_type: this.props.mediaType,
      set_claim_description: this.props.claimDescription,
      url: this.props.url,
      quote: this.props.quote,
      quote_attributions: this.props.quoteAttributions,
    };
    if (this.props.related_to_id) {
      vars.related_to_id = this.props.related_to_id;
    }
    return vars;
  }

  getFiles() {
    const { file } = this.props;
    return { file };
  }

  getConfigs() {
    const configs = [];
    const fieldIDs = {};
    if (!this.props.related && !this.props.related_to_id && this.props.team) {
      configs.push({
        type: 'RANGE_ADD',
        parentName: 'check_search_team',
        parentID: this.props.team.search_id,
        connectionName: 'medias',
        edgeName: 'project_mediaEdge',
        rangeBehaviors: () => ('prepend'),
      });
      fieldIDs.check_search_team = this.props.team.search_id;
      fieldIDs.team = this.props.team.id;
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
            claim_description
            last_status_obj {
              id
            }
            last_status
          },
          check_search_team {
            id
          },
        }`,
      ],
    });

    if (this.props.related_to_id) {
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
