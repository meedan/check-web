import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import MediaRoute from '../../relay/MediaRoute';
import { can } from '../Can';
import CreateAnalysisMutation from '../../relay/mutations/CreateAnalysisMutation';
import UpdateAnalysisMutation from '../../relay/mutations/UpdateAnalysisMutation';
import { units } from '../../styles/js/shared';
import CheckContext from '../../CheckContext';

class MediaAnalysisComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      canSave: false,
      saving: false,
      value: null,
    };
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleSave() {
    const cachedMedia = this.props.cachedMedia || {};
    const media = Object.assign(cachedMedia, this.props.media);

    const onFailure = () => {
      const message = <FormattedMessage id="mediaAnalysis.error" defaultMessage="Could not save analysis." />;
      this.context.setMessage(message);
      this.setState({ saving: false });
    };

    const onSuccess = () => {
      const message = <FormattedMessage id="mediaAnalysis.success" defaultMessage="Analysis saved successfully!" />;
      this.context.setMessage(message);
      this.setState({ saving: false });
    };

    const fields = {
      analysis_text: this.state.value,
    };

    if (this.state.canSave) {
      if (media.dynamic_annotation_analysis) {
        Relay.Store.commitUpdate(
          new UpdateAnalysisMutation({
            parent_type: 'project_media',
            annotator: this.getContext().currentUser,
            annotated: media,
            annotation: {
              id: media.dynamic_annotation_analysis.id,
              fields,
              annotated_type: 'ProjectMedia',
              annotated_id: media.dbid,
            },
          }),
          { onFailure, onSuccess },
        );
      } else {
        Relay.Store.commitUpdate(
          new CreateAnalysisMutation({
            parent_type: 'project_media',
            annotator: this.getContext().currentUser,
            annotated: media,
            annotation: {
              fields,
              annotated_type: 'ProjectMedia',
              annotated_id: media.dbid,
            },
          }),
          { onFailure, onSuccess },
        );
      }
    }

    this.setState({ saving: true });
  }

  handleChange(event, newValue) {
    this.context.setMessage(null);
    const canSave = (newValue.trim().length > 0);
    this.setState({ value: newValue, canSave });
  }

  render() {
    const cachedMedia = this.props.cachedMedia || {};
    const media = Object.assign(cachedMedia, this.props.media);

    const disabled = (media.archived || !can(media.permissions, 'create Dynamic'));

    let value = null;
    if (media.dynamic_annotation_analysis) {
      value = JSON.parse(media.dynamic_annotation_analysis.content)[0].formatted_value;
    }

    return (
      <div>
        <div>
          <TextField
            floatingLabelText={
              <FormattedMessage
                id="mediaAnalysis.type"
                defaultMessage="Type something here..."
              />
            }
            textareaStyle={{ background: '#fff', padding: units(1) }}
            defaultValue={value}
            disabled={disabled}
            onChange={this.handleChange.bind(this)}
            multiLine
            fullWidth
            rows={20}
          />
        </div>
        { !disabled ?
          <div>
            <FlatButton
              label={
                <FormattedMessage
                  id="mediaAnalysis.save"
                  defaultMessage="Save"
                />
              }
              primary
              disabled={this.state.saving || !this.state.canSave}
              onClick={this.handleSave.bind(this)}
            />
          </div> : null }
      </div>
    );
  }
}

MediaAnalysisComponent.contextTypes = {
  store: PropTypes.object,
  setMessage: PropTypes.func,
};

const MediaAnalysisContainer = Relay.createContainer(MediaAnalysisComponent, {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        archived
        permissions
        dynamic_annotation_analysis {
          id
          dbid
          content
        }
      }
    `,
  },
});

const MediaAnalysis = (props) => {
  const ids = `${props.media.dbid},${props.media.project_id}`;
  const route = new MediaRoute({ ids });
  const cachedMedia = Object.assign({}, props.media);

  return (
    <Relay.RootContainer
      Component={MediaAnalysisContainer}
      renderFetched={data =>
        <MediaAnalysisContainer cachedMedia={cachedMedia} {...props} {...data} />}
      route={route}
    />
  );
};

export default MediaAnalysis;
