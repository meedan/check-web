import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import MemeEditor from './MemeEditor';
import SVGViewport from './SVGViewport';
import TimeBefore from '../TimeBefore';
import MediaUtil from '../media/MediaUtil';
import globalStrings from '../../globalStrings';
import CheckContext from '../../CheckContext';
import { safelyParseJSON, getStatus, getStatusStyle } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import { Row, ContentColumn, mediaQuery, units } from '../../styles/js/shared';
import CreateMemebusterMutation from '../../relay/mutations/CreateMemebusterMutation';
import UpdateMemebusterMutation from '../../relay/mutations/UpdateMemebusterMutation';

const StyledTwoColumnLayout = styled(ContentColumn)`
  flex-direction: column;
  ${mediaQuery.desktop`
    display: flex;
    justify-content: center;
    max-width: ${units(120)};
    padding: 0;
    flex-direction: row;

    .memebuster__editor-column {
      max-width: ${units(50)} !important;
    }

    .memebuster__viewport-column {
      max-width: ${units(150)};
    }
  `}
`;

class MemebusterComponent extends React.Component {
  constructor(props) {
    super(props);

    const status = getStatus(mediaStatuses(props.media), mediaLastStatus(props.media));

    const defaultParams = {
      headline: MediaUtil.title(props.media, props.media.embed, props.intl),
      image: props.media.media.picture,
      description: props.media.embed.description,
      overlayColor: getStatusStyle(status, 'backgroundColor'),
      statusText: status.label,
      statusColor: getStatusStyle(status, 'color'),
      teamName: props.media.team.name,
      teamAvatar: props.media.team.avatar,
      teamUrl: props.media.team.contacts.edges[0] ? props.media.team.contacts.edges[0].node.web : '',
    };

    const savedParams = this.getSavedParams();

    this.state = { params: Object.assign(defaultParams, savedParams) };
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  getField = (content, field_name) => {
    const field = content.find(i => i.field_name === field_name);
    return field ? field.value : null;
  };

  getFieldFromAnnotation = (field_name) => {
    const annotation = this.getLastSaveAnnotation();

    if (annotation) {
      const content = safelyParseJSON(annotation.content);
      return this.getField(content, field_name);
    }

    return null;
  }

  getLastSaveAnnotation = () => {
    if (this.props.media.annotations.edges[0]) {
      return this.props.media.annotations.edges[0].node;
    }

    return null;
  };

  getSavedParams = () => {
    const saved = this.getLastSaveAnnotation();

    if (saved) {
      const content = safelyParseJSON(saved.content);
      return ({
        headline: this.getField(content, 'memebuster_headline'),
        description: this.getField(content, 'memebuster_body'),
        statusText: this.getField(content, 'memebuster_status'),
        image: this.getField(content, 'memebuster_image'),
        overlayColor: this.getField(content, 'memebuster_overlay'),
      });
    }

    return {};
  };

  returnToMedia = () => {
    browserHistory.push(window.location.pathname.replace('/memebuster', ''));
  };

  handleParamChange = (param) => {
    const params = Object.assign(this.state.params, param);
    this.setState({ params });
  };

  handleSubmit = (action) => {
    const fields = {
      memebuster_operation: action,
      memebuster_image: this.state.params.image,
      memebuster_headline: this.state.params.headline,
      memebuster_body: this.state.params.description,
      memebuster_status: this.state.params.statusText,
      memebuster_overlay: this.state.params.overlayColor,
    };

    const onFailure = () => { console.log('failure'); //TODO handle failure };

    const saved = this.getLastSaveAnnotation();

    if (!saved) {
      Relay.Store.commitUpdate(
        new CreateMemebusterMutation({
          image: this.state.params.image,
          parent_type: 'project_media',
          annotator: this.getContext().currentUser,
          annotated: this.props.media,
          annotation: {
            fields,
            annotated_type: 'ProjectMedia',
            annotated_id: this.props.media.dbid,
          },
        }),
        { onFailure },
      );
    } else {
      Relay.Store.commitUpdate(
        new UpdateMemebusterMutation({
          id: saved.id,
          image: this.state.params.image,
          parent_type: 'project_media',
          annotator: this.getContext().currentUser,
          annotated: this.props.media,
          annotation: {
            fields,
            annotated_type: 'ProjectMedia',
            annotated_id: this.props.media.dbid,
          },
        }),
        { onFailure },
      );
    }
  };

  render() {
    const saved = this.getLastSaveAnnotation();
    const published = this.getFieldFromAnnotation('memebuster_published_at');

    return (
      <div>
        <StyledTwoColumnLayout>
          <ContentColumn className="memebuster__editor-column">
            <MemeEditor
              media={this.props.media}
              params={this.state.params}
              onParamChange={this.handleParamChange}
            />
          </ContentColumn>
          <ContentColumn className="memebuster__viewport-column">
            <SVGViewport params={this.state.params} />
            <div>
              { saved ?
                <div>
                  <FormattedMessage
                    id="MemebusterComponent.lastSaved"
                    defaultMessage="Last saved {time} by {name}"
                    values={{
                      time: <TimeBefore
                        date={MediaUtil.createdAt({ published: saved.updated_at })}
                      />,
                      name: saved.annotator.name,
                    }}
                  />
                </div> : null
              }
              { published ?
                <div>
                  <FormattedMessage
                    id="MemebusterComponent.lastPublished"
                    defaultMessage="Last published {time} by {name}"
                    values={{
                      time: <TimeBefore
                        date={MediaUtil.createdAt({ published })}
                      />,
                      name: saved.annotator.name,
                    }}
                  />
                </div> : null
              }
            </div>
            <Row>
              <div style={{ marginLeft: '250px', marginTop: '20px' }}>
                <Button onClick={this.returnToMedia}>
                  {this.props.intl.formatMessage(globalStrings.cancel)}
                </Button>
                <Button onClick={() => this.handleSubmit('save')}>
                  {this.props.intl.formatMessage(globalStrings.save)}
                </Button>
                <Button variant="contained" color="primary" onClick={() => this.handleSubmit('publish')}>
                  <FormattedMessage id="MemebusterComponent.publish" defaultMessage="Publish" />
                </Button>
              </div>
            </Row>
          </ContentColumn>
        </StyledTwoColumnLayout>
      </div>
    );
  }
}

MemebusterComponent.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(MemebusterComponent);
