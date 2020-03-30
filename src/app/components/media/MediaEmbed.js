import React, { Component } from 'react';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import Popover from '@material-ui/core/Popover';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import TextField from 'material-ui/TextField';
import CopyToClipboard from 'react-copy-to-clipboard';
import IconArrowBack from '@material-ui/icons/ArrowBack';
import IconButton from '@material-ui/core/IconButton';
import styled from 'styled-components';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import PageTitle from '../PageTitle';
import MediaUtil from './MediaUtil';
import MediaStatus from './MediaStatus';
import PenderCard from '../PenderCard';
import CheckContext from '../../CheckContext';
import MediaRoute from '../../relay/MediaRoute';
import Message from '../Message';
import { can } from '../Can';
import CreateMemebusterMutation from '../../relay/mutations/CreateMemebusterMutation';
import UpdateMemebusterMutation from '../../relay/mutations/UpdateMemebusterMutation';
import RelayContainer from '../../relay/RelayContainer';
import {
  black87,
  black54,
  alertRed,
  ContentColumn,
  units,
  FadeIn,
  SlideIn,
} from '../../styles/js/shared';

const StyledTwoColumnLayout = styled(ContentColumn)`
  flex-direction: column;
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 100%;
  padding: 0;
  flex-direction: row;

  .column {
    max-width: 100%;
  }
`;

const StyledPopover = styled(Popover)`
  .media-embed__customization-label {
    flex-grow: 1;
    font-size: ${units(2)};
    margin: ${units(2)}
    color: ${black54};

    .media-embed__customization-slogan {
      color: ${black87};
      font-size: 14px;
    }
    padding-#{$to-direction}: 16px;
  }

  #media-embed__copy-code, #media-embed__copy-share-url {
    padding: 16px;
    width: 560px;

    .media-embed__warning {
      color: ${alertRed};
      font-size: 14px;
      font-weight: bold;
    }

    .media-embed__copy-footer {
      display: flex;
    }

    #media-embed__code-field, #media-embed__share-field {
      background: transparent;
      border: 1px solid #eee;
      flex-grow: 1;
      font-family: 'Roboto Mono';
      font-size: 12px;
      padding: 1px;

      &:focus {
        outline: none;
      }
    }
  }
`;

class MediaEmbedComponent extends Component {
  constructor(props) {
    super(props);

    const { team } = props.media;
    const customizationOptions = {};
    let url = window.location.href.replace(/\/embed$/, `?t=${new Date().getTime()}`);
    if (props.media.dynamic_annotation_memebuster) {
      JSON.parse(props.media.dynamic_annotation_memebuster.content).forEach((field) => {
        if (field.field_name === 'memebuster_show_analysis') {
          customizationOptions.analysis = field.value;
        } else if (field.field_name === 'memebuster_disclaimer') {
          customizationOptions.disclaimer = field.value;
        } else if (field.field_name === 'memebuster_tasks') {
          field.value.forEach((id) => {
            customizationOptions[`task-${id}`] = true;
          });
        } else if (field.field_name === 'memebuster_custom_url') {
          customizationOptions.url = field.value;
          if (/^http/.test(field.value)) {
            url = field.value;
          }
        }
      });
    } else {
      if (team.get_disclaimer) {
        customizationOptions.disclaimer = team.get_disclaimer;
      }
      if (team.get_embed_tasks) {
        const teamTasksIds = team.get_embed_tasks.split(',');
        props.media.tasks.edges.forEach((task) => {
          const id = task.node.team_task_id ? task.node.team_task_id.toString() : '';
          if (teamTasksIds.indexOf(id) > -1) {
            customizationOptions[`task-${task.node.dbid}`] = true;
          }
        });
      }
      customizationOptions.analysis = !!team.get_embed_analysis;
    }

    this.state = {
      codeMenuOpened: false,
      codeMenuAnchor: null,
      codeCopied: false,
      shareMenuOpened: false,
      shareMenuAnchor: null,
      urlCopied: false,
      version: new Date().getTime(),
      pending: false,
      message: null,
      url,
      customizationOptions,
    };
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  handleCodeMenuOpen(e) {
    e.preventDefault();

    this.setState({
      codeMenuOpened: true,
      codeMenuAnchor: e.currentTarget,
    });
  }

  handleCodeMenuClose() {
    this.setState({
      codeMenuOpened: false,
    });
  }

  handleCopyEmbedCode() {
    this.setState({
      codeCopied: true,
    });
  }

  handleShareMenuOpen(e) {
    e.preventDefault();

    this.setState({
      shareMenuOpened: true,
      shareMenuAnchor: e.currentTarget,
    });
  }

  handleShareMenuClose() {
    this.setState({
      shareMenuOpened: false,
    });
  }

  handleCopyShareUrl() {
    this.setState({
      urlCopied: true,
    });
  }

  handleSelectCheckbox(option) {
    const options = Object.assign({}, this.state.customizationOptions);
    options[option] = !options[option];

    this.setState({
      customizationOptions: options,
    });
  }

  handleChangeDisclaimer(event, newValue) {
    const options = Object.assign({}, this.state.customizationOptions);
    options.disclaimer = newValue;

    this.setState({
      customizationOptions: options,
    });
  }

  handleChangeCustomUrl(event, newValue) {
    const options = Object.assign({}, this.state.customizationOptions);
    options.url = newValue;

    this.setState({
      customizationOptions: options,
    });
  }

  handleSave() {
    let url = window.location.href.replace(/\/embed$/, `?t=${new Date().getTime()}`);

    const fields = { memebuster_tasks: [] };
    if (this.state.customizationOptions.disclaimer !== undefined) {
      fields.memebuster_disclaimer = this.state.customizationOptions.disclaimer;
    }
    Object.keys(this.state.customizationOptions).forEach((key) => {
      if (/^task-/.test(key) && this.state.customizationOptions[key]) {
        fields.memebuster_tasks.push(parseInt(key.replace(/^task-/, ''), 10));
      }
    });
    if (this.state.customizationOptions.url !== undefined) {
      fields.memebuster_custom_url = this.state.customizationOptions.url;
      if (/^http/.test(fields.memebuster_custom_url)) {
        url = fields.memebuster_custom_url;
      }
    }
    if (this.state.customizationOptions.analysis !== undefined) {
      fields.memebuster_show_analysis = !!this.state.customizationOptions.analysis;
    }

    const onFailure = () => {
      const message = <FormattedMessage id="mediaEmbed.error" defaultMessage="Could not save report" />;
      this.setState({ pending: false, message });
    };

    const onSuccess = () => {
      const version = this.state.version + 1;
      this.setState({
        pending: false,
        version,
        url,
      });
    };

    const annotation = this.props.media.dynamic_annotation_memebuster;

    this.setState({ pending: true, message: null });

    if (!annotation) {
      Relay.Store.commitUpdate(
        new CreateMemebusterMutation({
          parent_type: 'project_media',
          annotated: this.props.media,
          annotation: {
            action: 'report',
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
          parent_type: 'project_media',
          annotated: this.props.media,
          annotation: {
            action: 'report',
            fields,
            annotated_type: 'ProjectMedia',
            annotated_id: this.props.media.dbid,
          },
        }),
        { onFailure, onSuccess },
      );
    }
  }

  statusCallback() {
    let { url } = this.state;
    if (!this.state.customizationOptions.url || !/^http/.test(this.state.customizationOptions.url)) {
      url = window.location.href.replace(/\/embed$/, `?t=${new Date().getTime()}`);
    }
    this.setState({ version: (this.state.version + 1), url });
  }

  render() {
    const { media } = this.props;
    const data = media.metadata;
    const embedTag = `<script src="${config.penderUrl}/api/medias.js?url=${encodeURIComponent(this.state.url)}"></script>`;
    const metadata = JSON.parse(media.oembed_metadata);
    const shareUrl = metadata.embed_url;
    const itemUrl = metadata.permalink.replace(/^https?:\/\/[^/]+/, '');
    const saveDisabled = !can(media.permissions, 'update ProjectMedia');

    return (
      <PageTitle
        prefix={MediaUtil.title({ media }, data, this.props.intl)}
        team={media.team}
        skipTeam={false}
        data-id={media.dbid}
      >
        <div id="media-embed">
          <StyledPopover
            open={this.state.codeMenuOpened}
            anchorEl={this.state.codeMenuAnchor}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            onClose={this.handleCodeMenuClose.bind(this)}
          >
            <div id="media-embed__copy-code">
              <p className="media-embed__warning">
                <FormattedMessage
                  id="mediaEmbed.warning"
                  defaultMessage="Warning — sharing this will expose information to people outside your private workspace. Proceed with caution."
                />
              </p>
              <p className="media-embed__copy-footer">
                <input disabled readOnly value={embedTag} id="media-embed__code-field" />
                {this.state.codeCopied ?
                  <span className="media-embed__copy-button-inactive">
                    <FormattedMessage
                      id="mediaEmbed.copyButtonInactive"
                      defaultMessage="Copied"
                    />
                  </span>
                  :
                  <span className="media-embed__copy-button">
                    <FormattedMessage id="mediaEmbed.copyButton" defaultMessage="Copy" />
                  </span>}
              </p>
            </div>
          </StyledPopover>

          <StyledPopover
            open={this.state.shareMenuOpened}
            anchorEl={this.state.shareMenuAnchor}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            onClose={this.handleShareMenuClose.bind(this)}
          >
            <div id="media-embed__copy-share-url">
              <p className="media-embed__warning">
                <FormattedMessage
                  id="mediaEmbed.warning"
                  defaultMessage="Warning — sharing this will expose information to people outside your private workspace. Proceed with caution."
                />
              </p>
              <p className="media-embed__copy-footer">
                <input disabled readOnly value={shareUrl} id="media-embed__share-field" />
                {this.state.urlCopied ?
                  <span className="media-embed__copy-button-inactive">
                    <FormattedMessage
                      id="mediaEmbed.copyButtonInactive"
                      defaultMessage="Copied"
                    />
                  </span>
                  :
                  <span className="media-embed__copy-button">
                    <FormattedMessage id="mediaEmbed.copyButton" defaultMessage="Copy" />
                  </span>}
              </p>
            </div>
          </StyledPopover>

          <div id="media-embed__actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div
              style={{
                marginRight: units(1),
                marginLeft: units(1),
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  marginRight: units(4),
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Link to={itemUrl}>
                  <IconButton>
                    <FadeIn>
                      <SlideIn>
                        <IconArrowBack color={black54} />
                      </SlideIn>
                    </FadeIn>
                  </IconButton>
                </Link>
                <FormattedMessage
                  id="mediaEmbed.back"
                  defaultMessage="Back to annotation"
                />
              </div>
              <CopyToClipboard text={embedTag} onCopy={this.handleCopyEmbedCode.bind(this)}>
                <Button
                  id="media-embed__actions-copy"
                  onClick={this.handleCodeMenuOpen.bind(this)}
                >
                  <FormattedMessage
                    id="mediaEmbed.copyEmbedCode"
                    defaultMessage="Copy embed code"
                  />
                </Button>
              </CopyToClipboard>
              <CopyToClipboard text={shareUrl} onCopy={this.handleCopyShareUrl.bind(this)}>
                <Button
                  id="media-embed__actions-copy"
                  onClick={this.handleShareMenuOpen.bind(this)}
                >
                  <FormattedMessage
                    id="mediaEmbed.copyShareUrl"
                    defaultMessage="Copy share URL"
                  />
                </Button>
              </CopyToClipboard>
            </div>
            <div
              style={{
                marginLeft: units(2),
                marginRight: units(2),
              }}
            >
              <MediaStatus
                media={media}
                readonly={media.archived || media.last_status_obj.locked}
                callback={this.statusCallback.bind(this)}
              />
            </div>
          </div>

          <StyledTwoColumnLayout>
            <ContentColumn className="column">
              <PenderCard
                url={this.state.url}
                domId="embed-id"
                fallback={null}
                mediaVersion={this.state.version}
              />
            </ContentColumn>
            <ContentColumn className="column">
              <Message message={this.state.message} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>
                  <FormattedMessage
                    id="mediaEmbed.editorTitle"
                    defaultMessage="Select the content to display in your report"
                  />
                </h2>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={this.state.pending || saveDisabled}
                  onClick={this.handleSave.bind(this)}
                  style={{
                    marginRight: units(1),
                    marginLeft: units(1),
                  }}
                >
                  <FormattedMessage
                    id="mediaEmbed.update"
                    defaultMessage="Update"
                  />
                </Button>
              </div>
              <div id="media-embed__customization-menu">
                <div style={{ marginTop: units(4) }}>
                  <h3>
                    <FormattedMessage
                      id="mediaEmbed.analysis"
                      defaultMessage="Analysis"
                    />
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          className="media-embed__customization-option"
                          checked={this.state.customizationOptions.analysis}
                          onChange={this.handleSelectCheckbox.bind(this, 'analysis')}
                        />
                      }
                      label={
                        <FormattedMessage
                          id="mediaEmbed.analysisSlogan"
                          defaultMessage="Show analysis in the report"
                        />
                      }
                    />
                  </div>
                </div>

                <div style={{ marginTop: units(2) }}>
                  <h3>
                    <FormattedMessage
                      id="mediaEmbed.tasks"
                      defaultMessage="Tasks"
                    />
                  </h3>
                  <FormattedMessage
                    id="mediaEmbed.tasksSlogan"
                    defaultMessage="The selected tasks will be included in the report if they are resolved."
                  />
                </div>
                {media.tasks.edges.map(task => (
                  <div key={task.node.dbid} style={{ display: 'flex', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          className="media-embed__customization-option"
                          checked={this.state.customizationOptions[`task-${task.node.dbid}`]}
                          onChange={this.handleSelectCheckbox.bind(this, `task-${task.node.dbid}`)}
                        />
                      }
                      label={task.node.label}
                    />
                  </div>
                ))}

                <div style={{ marginTop: units(4) }}>
                  <h3>
                    <FormattedMessage
                      id="mediaEmbed.disclaimer"
                      defaultMessage="Disclaimer"
                    />
                  </h3>
                  <TextField
                    floatingLabelText={
                      <FormattedMessage
                        id="mediaEmbed.disclaimerSlogan"
                        defaultMessage="Disclaimer that will be shown at the bottom of the report with the workspace logo"
                      />
                    }
                    defaultValue={this.state.customizationOptions.disclaimer}
                    onChange={this.handleChangeDisclaimer.bind(this)}
                    fullWidth
                  />
                </div>

                <div style={{ marginTop: units(4) }}>
                  <h3>
                    <FormattedMessage
                      id="mediaEmbed.customUrl"
                      defaultMessage="Send a custom URL instead of this report"
                    />
                  </h3>
                  <TextField
                    floatingLabelText={
                      <FormattedMessage
                        id="mediaEmbed.validUrl"
                        defaultMessage="Please enter a valid URL"
                      />
                    }
                    defaultValue={this.state.customizationOptions.url}
                    onChange={this.handleChangeCustomUrl.bind(this)}
                    fullWidth
                  />
                </div>
              </div>
            </ContentColumn>
          </StyledTwoColumnLayout>
        </div>
      </PageTitle>
    );
  }
}

MediaEmbedComponent.contextTypes = {
  store: PropTypes.object,
};

const MediaEmbedContainer = Relay.createContainer(MediaEmbedComponent, {
  initialVariables: {
    contextId: null,
  },
  fragments: {
    media: () => Relay.QL`
      fragment on ProjectMedia {
        id
        dbid
        oembed_metadata
        metadata
        demand
        verification_statuses
        permissions
        archived
        project_id
        project_ids
        last_status
        last_status_obj {
          id
          dbid
          locked
          content
        }
        dynamic_annotation_memebuster {
          id
          dbid
          content
        }
        tasks(first: 10000) {
          edges {
            node {
              id
              dbid
              label
              team_task_id
            }
          }
        }
        team {
          name
          slug
          get_disclaimer
          get_embed_tasks
          get_embed_analysis
        }
      }
    `,
  },
});

const MediaEmbed = (props) => {
  const ids = `${props.params.mediaId},${props.params.projectId}`;
  const route = new MediaRoute({ ids });

  return (
    <RelayContainer
      Component={MediaEmbedContainer}
      route={route}
      renderFetched={data => <MediaEmbedContainer {...props} {...data} />}
    />
  );
};

MediaEmbed.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

MediaEmbedComponent.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(MediaEmbed);
