import React from 'react';
import { FormattedMessage, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { browserHistory } from 'react-router';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import MemeEditor from './MemeEditor';
import SVGViewport from './SVGViewport';
import { can } from '../Can';
import PageTitle from '../PageTitle';
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

    this.state = { params: Object.assign(defaultParams, savedParams), pending: false };
  }

  componentDidMount() {
    this.subscribe();
  }

  componentWillUnmount() {
    this.unsubscribe();
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
    const annotation = this.getLastSaveAnnotation();

    if (annotation) {
      const content = safelyParseJSON(annotation.content);
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

  getPublishedText = () => {
    const annotation = this.getLastSaveAnnotation();
    const publish_sent = this.getFieldFromAnnotation('memebuster_operation') === 'publish';
    const publish_done = this.getFieldFromAnnotation('memebuster_published_at');

    let text = null;

    if (publish_sent) {
      text = (<FormattedMessage
        id="MemebusterComponent.publishing"
        defaultMessage="Publishing..."
      />);
    }

    if (publish_done) {
      text = (<FormattedMessage
        id="MemebusterComponent.lastPublished"
        defaultMessage="Last published {time} by {name}"
        values={{
          time: <TimeBefore
            date={new Date(publish_done)}
          />,
          name: annotation.annotator.name,
        }}
      />);
    }

    return (
      <div style={{ fontFamily: 'Roboto', fontSize: 12 }}>
        {text}
      </div>
    );
  }

  subscribe() {
    const { pusher } = this.getContext();
    if (pusher) {
      pusher.subscribe(this.props.media.pusher_channel).bind('media_updated', 'MemebusterComponent', (data, run) => {
        const message = JSON.parse(data.message);
        if (
          message.annotation_type === 'memebuster' &&
          message.annotated_id === this.props.media.dbid
        ) {
          if (run) {
            this.props.relay.forceFetch();
            return true;
          }
          return {
            id: `memebuster-${this.props.media.dbid}`,
            callback: this.props.relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    const { pusher } = this.getContext();
    if (pusher) {
      pusher.unsubscribe(this.props.media.pusher_channel);
    }
  }

  returnToMedia = () => {
    browserHistory.push(window.location.pathname.replace('/memebuster', ''));
  };

  handleParamChange = (param) => {
    const params = Object.assign(this.state.params, param);
    this.setState({ params });
  };

  handleSubmit = (action) => {
    this.setState({ pending: true });
    let imagePath = '';
    let imageFile = null;

    if (this.state.params.image && typeof (this.state.params.image) === 'string') {
      imagePath = this.state.params.image;
    }

    if (this.state.params.image && typeof (this.state.params.image) === 'object') {
      imageFile = this.state.params.image;
    }

    const fields = {
      memebuster_operation: action,
      memebuster_image: imagePath,
      memebuster_headline: this.state.params.headline,
      memebuster_body: this.state.params.description,
      memebuster_status: this.state.params.statusText,
      memebuster_overlay: this.state.params.overlayColor,
    };

    const onFailure = (transaction) => {
      const error = transaction.getError();
      // eslint-disable-next-line no-console
      console.error(`Error performing Memebuster mutation: ${error}`);
      this.setState({ pending: false });
    };

    const onSuccess = () => {
      this.setState({ pending: false });
    };

    const annotation = this.getLastSaveAnnotation();

    if (!annotation) {
      Relay.Store.commitUpdate(
        new CreateMemebusterMutation({
          image: imageFile,
          parent_type: 'project_media',
          annotator: this.getContext().currentUser,
          annotated: this.props.media,
          annotation: {
            action,
            fields,
            annotated_type: 'ProjectMedia',
            annotated_id: this.props.media.dbid,
          },
        }),
        { onFailure, onSuccess },
      );
    } else {
      Relay.Store.commitUpdate(
        new UpdateMemebusterMutation({
          id: annotation.id,
          image: imageFile,
          parent_type: 'project_media',
          annotator: this.getContext().currentUser,
          annotated: this.props.media,
          annotation: {
            action,
            fields,
            annotated_type: 'ProjectMedia',
            annotated_id: this.props.media.dbid,
          },
        }),
        { onFailure, onSuccess },
      );
    }
  };

  handleBrokenImage() {
    const params = Object.assign({}, this.state.params);
    params.image = '';
    this.setState({ params });
  }

  validate = () => {
    const {
      headline,
      image,
      statusText,
      description,
      overlayColor,
    } = this.state.params;

    if (headline && image && statusText && description && overlayColor) {
      return true;
    }

    return false;
  };

  render() {
    const { media } = this.props;
    const data = media.embed;
    const annotation = this.getLastSaveAnnotation();
    const template = media.team.get_memebuster_template;

    const saveDisabled = !can(media.permissions, 'update ProjectMedia') || !this.validate() || this.state.pending;
    const publishDisabled = !can(media.permissions, 'lock Annotation') || !this.validate() || this.state.pending;

    return (
      <PageTitle
        prefix={MediaUtil.title(media, data, this.props.intl)}
        team={this.getContext().team}
        data-id={media.dbid}
      >
        <StyledTwoColumnLayout>
          {this.state.params.image && typeof (this.state.params.image) === 'string' ?
            <img
              alt=""
              src={this.state.params.image}
              style={{ display: 'none' }}
              onError={this.handleBrokenImage.bind(this)}
            /> : null }
          <ContentColumn className="memebuster__editor-column">
            <MemeEditor
              media={this.props.media}
              params={this.state.params}
              onParamChange={this.handleParamChange}
            />
          </ContentColumn>
          <ContentColumn className="memebuster__viewport-column">
            <SVGViewport params={this.state.params} template={template} />
            <div>
              { annotation ?
                <div style={{ fontFamily: 'Roboto', fontSize: 12 }}>
                  <FormattedMessage
                    id="MemebusterComponent.lastSaved"
                    defaultMessage="Last saved {time} by {name}"
                    values={{
                      time: <TimeBefore
                        date={MediaUtil.createdAt({ published: annotation.updated_at })}
                      />,
                      name: annotation.annotator.name,
                    }}
                  />
                </div> : null
              }
              <div>
                { this.getPublishedText() }
              </div>
            </div>
            <Row>
              <div style={{ marginLeft: '250px', marginTop: '20px' }}>
                <Button onClick={this.returnToMedia}>
                  {this.props.intl.formatMessage(globalStrings.cancel)}
                </Button>
                <Button onClick={() => this.handleSubmit('save')} disabled={saveDisabled}>
                  {this.props.intl.formatMessage(globalStrings.save)}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => this.handleSubmit('publish')}
                  disabled={publishDisabled}
                >
                  <FormattedMessage id="MemebusterComponent.publish" defaultMessage="Publish" />
                </Button>
              </div>
            </Row>
          </ContentColumn>
        </StyledTwoColumnLayout>
      </PageTitle>
    );
  }
}

MemebusterComponent.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(MemebusterComponent);
