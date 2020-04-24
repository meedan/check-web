import React, { Component } from 'react';
import { FormattedMessage, injectIntl, intlShape, defineMessages } from 'react-intl';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import CopyToClipboard from 'react-copy-to-clipboard';
import IconArrowBack from '@material-ui/icons/ArrowBack';
import IconEdit from '@material-ui/icons/Edit';
import IconPlay from '@material-ui/icons/PlayArrow';
import IconPause from '@material-ui/icons/Pause';
import IconButton from '@material-ui/core/IconButton';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Tooltip from '@material-ui/core/Tooltip';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TextField from '@material-ui/core/TextField';
import HelpIcon from '@material-ui/icons/HelpOutline';
import styled from 'styled-components';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import PageTitle from '../PageTitle';
import MediaUtil from './MediaUtil';
import MediaStatus from './MediaStatus';
import ReportImagePreview from './ReportImagePreview';
import MediaRoute from '../../relay/MediaRoute';
import Message from '../Message';
import UploadImage from '../UploadImage';
import { can } from '../Can';
import CreateReportDesignMutation from '../../relay/mutations/CreateReportDesignMutation';
import UpdateReportDesignMutation from '../../relay/mutations/UpdateReportDesignMutation';
import RelayContainer from '../../relay/RelayContainer';
import ParsedText from '../ParsedText';
import ConfirmDialog from '../layout/ConfirmDialog';
import { getStatus, getStatusStyle } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import {
  black87,
  black54,
  black32,
  alertRed,
  checkBlue,
  completedGreen,
  inProgressYellow,
  ContentColumn,
  units,
  FadeIn,
  SlideIn,
} from '../../styles/js/shared';

const messages = defineMessages({
  cantPublish: {
    id: 'reportDesigner.cantPublish',
    defaultMessage: 'You need to add content to your report before you can publish it',
  },
  canPublish: {
    id: 'reportDesigner.canPublish',
    defaultMessage: 'Publish report',
  },
  pauseReport: {
    id: 'reportDesigner.pauseReport',
    defaultMessage: 'Pause report',
  },
  introductionPlaceholder: {
    id: 'reportDesigner.introductionPlaceholder',
    defaultMessage: 'Type your introduction here...',
  },
  textPlaceholder: {
    id: 'reportDesigner.textPlaceholder',
    defaultMessage: 'Type your report here...',
  },
});

const StyledContainer = styled.div`
  * {
    font-family: Roboto, sans-serif;
  }

  h2 {
    font-size: large;
    margin-bottom: ${units(2)};
  }
`;

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

  #editor {
    position: relative;
  }

  #editor-mask {
    &.enabled {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: white;
      opacity: 0.8;
      z-index: 1;
    }
  }

  #image-preview {
    width: 504px;
    margin: ${units(2)} auto;
    border: 2px solid ${black32};
  }

  #media-preview {
    width: 100%;
  }

  .text-preview {
    border: 2px solid ${black32};
    background: white;
    padding: ${units(3)};
    color: black;
    width: 504px;
    margin: ${units(2)} auto;
    line-height: 1.5em;
    overflow-wrap: break-word;
    word-wrap: break-word;

    b {
      font-weight: bold;
    }

    i, em {
      font-style: italic;
    }
  }

  #disclaimer-preview {
    margin-top: ${units(2)};
  }

  #theme-selector {
    display: flex;
  }

  .theme-color {
    display: block;
    width: ${units(4)};
    height: ${units(4)};
    border-radius: 50%;
    border: 0;
    padding: 0;
    cursor: pointer;
    min-width: 0;
    min-height: 0;
    margin: ${units(1)};
  }
`;

const StyledPopover = styled(Popover)`
  .report-designer__customization-label {
    flex-grow: 1;
    font-size: ${units(2)};
    margin: ${units(2)}
    color: ${black54};

    .report-designer__customization-slogan {
      color: ${black87};
      font-size: 14px;
    }
    padding-#{$to-direction}: 16px;
  }

  #report-designer__copy-code, #report-designer__copy-share-url {
    padding: 16px;
    width: 560px;

    .report-designer__warning {
      color: ${alertRed};
      font-size: 14px;
      font-weight: bold;
    }

    .report-designer__copy-footer {
      display: flex;
    }

    #report-designer__code-field, #report-designer__share-field {
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

class ReportDesignerComponent extends Component {
  constructor(props) {
    super(props);

    let options = {};
    if (props.media.dynamic_annotation_report_design) {
      options = props.media.dynamic_annotation_report_design.data;
    }
    if (props.media.team.get_disclaimer && !options.disclaimer) {
      options.disclaimer = props.media.team.get_disclaimer;
    }
    if (props.media.team.get_use_disclaimer && Object.keys(options).indexOf('use_disclaimer') === -1) {
      options.use_disclaimer = true;
    }
    if (props.media.team.get_introduction && !options.introduction) {
      options.introduction = props.media.team.get_introduction;
    }
    if (props.media.team.get_use_introduction && Object.keys(options).indexOf('use_introduction') === -1) {
      options.use_introduction = true;
    }
    if (props.media.title && !options.headline) {
      options.headline = props.media.title.substring(0, 85);
    }
    if (props.media.description && !options.description) {
      options.description = props.media.description.substring(0, 120);
    }
    const status = getStatus(mediaStatuses(props.media), mediaLastStatus(props.media));
    if (status && status.label && !options.status_label) {
      options.status_label = status.label.substring(0, 16);
    }
    if (status && !options.theme_color) {
      options.theme_color = getStatusStyle(status, 'color');
    }
    const teamUrl = props.media.team.contacts.edges[0] ?
      props.media.team.contacts.edges[0].node.web :
      window.location.href.match(/https?:\/\/[^/]+\/[^/]+/)[0];
    if (teamUrl && !options.url) {
      options.url = teamUrl.substring(0, 32);
    }
    if (!options.state) {
      options.state = 'paused';
    }

    this.state = {
      codeMenuOpened: false,
      codeMenuAnchor: null,
      codeCopied: false,
      shareMenuOpened: false,
      shareMenuAnchor: null,
      urlCopied: false,
      pending: false,
      message: null,
      editing: false,
      image: null,
      showPublishConfirmationDialog: false,
      showPauseConfirmationDialog: false,
      showRepublishConfirmationDialog: false,
      showRepublishResendConfirmationDialog: false,
      options,
    };
  }

  settingsEmpty() {
    const { options } = this.state;
    if (Object.keys(options).length === 0 ||
      (!options.use_introduction && !options.use_visual_card && !options.use_text_message)) {
      return true;
    }
    let empty = true;
    Object.keys(options).forEach((option) => {
      if (options[option] !== '') {
        empty = false;
      }
    });
    return empty;
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

  handleEdit() {
    this.setState({
      editing: true,
      message: null,
    });
  }

  handleImage(image) {
    const options = Object.assign({}, this.state.options);
    const state = { options, message: null };
    if (typeof image === 'string') {
      state.image = null;
      state.options.image = image;
    } else {
      state.image = image;
      state.options.image = '';
    }
    this.setState(state);
  }

  handleClearImage() {
    this.handleImage(null);
  }

  handleDefaultImage() {
    const remove = document.getElementById('remove-image');
    if (remove) {
      remove.click();
    }
    const image = this.props.media.media.picture;
    this.handleImage(image);
  }

  handleSelectColor(color) {
    const options = Object.assign({}, this.state.options);
    options.theme_color = color;
    this.setState({ options, message: null });
  }

  handleConfirmPublish() {
    this.setState({ showPublishConfirmationDialog: true });
  }

  handlePublishConfirmed() {
    this.setState({ showPublishConfirmationDialog: false });
    this.handleChangeState('published', 'publish');
  }

  handleConfirmPause() {
    this.setState({ showPauseConfirmationDialog: true });
  }

  handlePauseConfirmed() {
    this.setState({ showPauseConfirmationDialog: false });
    this.handleChangeState('paused', 'pause');
  }

  handleConfirmRepublish() {
    this.setState({ showRepublishConfirmationDialog: true });
  }

  handleRepublishConfirmed() {
    let action = 'republish_but_not_resend';
    if (document.getElementById('republish-and-resend') && document.getElementById('republish-and-resend').checked) {
      action = 'republish_and_resend';
    }
    this.handleChangeState('published', action);
    this.setState({ showRepublishConfirmationDialog: false });
  }

  handleConfirmRepublishResend() {
    this.setState({ showRepublishResendConfirmationDialog: true });
  }

  handleRepublishResendConfirmed() {
    this.handleChangeState('published', 'republish_and_resend');
    this.setState({ showRepublishResendConfirmationDialog: false });
  }

  handleCloseDialogs() {
    this.setState({
      showPublishConfirmationDialog: false,
      showPauseConfirmationDialog: false,
      showRepublishConfirmationDialog: false,
      showRepublishResendConfirmationDialog: false,
    });
  }

  handleChangeState(state, action) {
    const options = Object.assign({}, this.state.options);
    options.state = state;
    if (state === 'published') {
      options.last_published = parseInt(new Date().getTime() / 1000, 10).toString();
      options.previous_published_status_label = options.status_label;
    }
    this.setState({ options }, () => {
      this.handleSave(action);
    });
  }

  handleChange(field, e) {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const options = Object.assign({}, this.state.options);
    options[field] = value;
    this.setState({ options, message: null });
  }

  handleSave(action) {
    const onFailure = () => {
      const message = <FormattedMessage id="reportDesigner.error" defaultMessage="Could not save report" />;
      this.setState({ pending: false, message });
    };

    const onSuccess = () => {
      this.setState({ pending: false, editing: false, message: null });
    };

    const annotation = this.props.media.dynamic_annotation_report_design;

    this.setState({ pending: true, message: null });

    const fields = Object.assign({}, this.state.options);
    delete fields.last_published;
    delete fields.previous_published_status_label;

    if (!annotation) {
      Relay.Store.commitUpdate(
        new CreateReportDesignMutation({
          parent_type: 'project_media',
          image: this.state.image,
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
        new UpdateReportDesignMutation({
          id: annotation.id,
          image: this.state.image,
          parent_type: 'project_media',
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
  }

  previewIntroduction() {
    let { introduction } = this.state.options;
    if (!introduction) {
      introduction = '';
    }
    let firstSmoochRequest = this.props.media.first_smooch_request.edges;
    if (firstSmoochRequest.length > 0) {
      firstSmoochRequest = firstSmoochRequest[0].node;
      introduction = introduction.replace(/{{query_date}}/g, new Date(parseInt(firstSmoochRequest.created_at, 10) * 1000).toLocaleDateString());
      const firstSmoochRequestData = JSON.parse(firstSmoochRequest.content);
      const text = firstSmoochRequestData[0].value_json.text || '';
      introduction = introduction.replace(/{{query_message}}/g, text.replace(/[_*~`]+/g, ''));
    }
    introduction = introduction.replace(/{{status}}/g, this.state.options.status_label);
    return introduction;
  }

  previewMedia() {
    let media = null;
    let messageType = null;
    if (/{{query_message}}/.test(this.state.options.introduction)) {
      const firstSmoochRequest = this.props.media.first_smooch_request.edges;
      if (firstSmoochRequest.length > 0) {
        const data = JSON.parse(firstSmoochRequest[0].node.content)[0].value_json;
        media = data.mediaUrl;
        messageType = data.type;
      }
    }
    if (messageType === 'image') {
      return (<img src={media} id="media-preview" alt="" />);
    } else if (messageType) {
      return (<p><a href={media} target="_blank" rel="noopener noreferrer">{media}</a></p>);
    }
    return null;
  }

  statusCallback() {
    const options = Object.assign({}, this.state.options);
    const status = getStatus(mediaStatuses(this.props.media), mediaLastStatus(this.props.media));
    if (status) {
      options.previous_published_status_label = options.status_label;
      options.status_label = status.label.substring(0, 16);
      options.theme_color = getStatusStyle(status, 'color');
    }
    this.setState({ options });
  }

  render() {
    const { media } = this.props;
    const { options } = this.state;
    const data = media.metadata;
    const metadata = JSON.parse(media.oembed_metadata);
    const shareUrl = metadata.embed_url;
    const itemUrl = metadata.permalink.replace(/^https?:\/\/[^/]+/, '');
    const saveDisabled = !can(media.permissions, 'update ProjectMedia');
    const url = window.location.href.replace(/\/embed$/, `?t=${new Date().getTime()}`);
    const embedTag = `<script src="${config.penderUrl}/api/medias.js?url=${encodeURIComponent(url)}"></script>`;
    const empty = this.settingsEmpty();
    const mediaPreview = this.previewMedia();

    return (
      <PageTitle
        prefix={MediaUtil.title({ media }, data, this.props.intl)}
        team={media.team}
        skipTeam={false}
        data-id={media.dbid}
      >
        <StyledContainer id="report-designer">
          <StyledPopover
            open={this.state.codeMenuOpened}
            anchorEl={this.state.codeMenuAnchor}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            onClose={this.handleCodeMenuClose.bind(this)}
          >
            <div id="report-designer__copy-code">
              <p className="report-designer__warning">
                <FormattedMessage
                  id="reportDesigner.warning"
                  defaultMessage="Warning — sharing this will expose information to people outside your private workspace. Proceed with caution."
                />
              </p>
              <p className="report-designer__copy-footer">
                <input disabled readOnly value={embedTag} id="report-designer__code-field" />
                {this.state.codeCopied ?
                  <span className="report-designer__copy-button-inactive">
                    <FormattedMessage
                      id="reportDesigner.copyButtonInactive"
                      defaultMessage="Copied"
                    />
                  </span>
                  :
                  <span className="report-designer__copy-button">
                    <FormattedMessage id="reportDesigner.copyButton" defaultMessage="Copy" />
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
            <div id="report-designer__copy-share-url">
              <p className="report-designer__warning">
                <FormattedMessage
                  id="reportDesigner.warning"
                  defaultMessage="Warning — sharing this will expose information to people outside your private workspace. Proceed with caution."
                />
              </p>
              <p className="report-designer__copy-footer">
                <input disabled readOnly value={shareUrl} id="report-designer__share-field" />
                {this.state.urlCopied ?
                  <span className="report-designer__copy-button-inactive">
                    <FormattedMessage
                      id="reportDesigner.copyButtonInactive"
                      defaultMessage="Copied"
                    />
                  </span>
                  :
                  <span className="report-designer__copy-button">
                    <FormattedMessage id="reportDesigner.copyButton" defaultMessage="Copy" />
                  </span>}
              </p>
            </div>
          </StyledPopover>

          <div id="report-designer__actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  id="reportDesigner.back"
                  defaultMessage="Back to annotation"
                />
              </div>
              <CopyToClipboard text={embedTag} onCopy={this.handleCopyEmbedCode.bind(this)}>
                <Button
                  id="report-designer__actions-copy"
                  onClick={this.handleCodeMenuOpen.bind(this)}
                >
                  <FormattedMessage
                    id="reportDesigner.copyEmbedCode"
                    defaultMessage="Copy embed code"
                  />
                </Button>
              </CopyToClipboard>
              <CopyToClipboard text={shareUrl} onCopy={this.handleCopyShareUrl.bind(this)}>
                <Button
                  id="report-designer__actions-copy"
                  onClick={this.handleShareMenuOpen.bind(this)}
                >
                  <FormattedMessage
                    id="reportDesigner.copyShareUrl"
                    defaultMessage="Copy share URL"
                  />
                </Button>
              </CopyToClipboard>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginLeft: units(2),
                marginRight: units(2),
              }}
            >
              { this.state.editing ?
                <Button
                  variant="contained"
                  color="primary"
                  disabled={this.state.pending || saveDisabled}
                  onClick={this.handleSave.bind(this, 'save')}
                  style={{
                    marginRight: units(1),
                    marginLeft: units(1),
                  }}
                >
                  <IconEdit />
                  <FormattedMessage
                    id="reportDesigner.save"
                    defaultMessage="Save"
                  />
                </Button> :
                <Button
                  variant="contained"
                  color="primary"
                  disabled={this.state.pending || saveDisabled || options.state === 'published'}
                  onClick={this.handleEdit.bind(this)}
                  style={{
                    marginRight: units(1),
                    marginLeft: units(1),
                  }}
                >
                  <IconEdit />
                  <FormattedMessage
                    id="reportDesigner.edit"
                    defaultMessage="Edit"
                  />
                </Button> }
              { (!this.state.editing && options.state === 'paused') ?
                <Tooltip
                  title={
                    empty ?
                      this.props.intl.formatMessage(messages.cantPublish) :
                      this.props.intl.formatMessage(messages.canPublish)
                  }
                >
                  <Button
                    variant="contained"
                    disabled={this.state.pending || empty}
                    onClick={
                      () => {
                        if (options.last_published) {
                          if (options.previous_published_status_label &&
                            options.status_label !== options.previous_published_status_label) {
                            this.handleConfirmRepublishResend();
                          } else {
                            this.handleConfirmRepublish();
                          }
                        } else {
                          this.handleConfirmPublish();
                        }
                      }
                    }
                    style={{
                      background: completedGreen,
                      color: '#FFFFFF',
                      marginRight: units(1),
                      marginLeft: units(1),
                    }}
                  >
                    <IconPlay />
                    <FormattedMessage
                      id="reportDesigner.publish"
                      defaultMessage="Publish"
                    />
                  </Button>
                </Tooltip> : null }
              { (!this.state.editing && options.state === 'published') ?
                <Tooltip title={this.props.intl.formatMessage(messages.pauseReport)}>
                  <Button
                    variant="contained"
                    disabled={this.state.pending}
                    onClick={this.handleConfirmPause.bind(this)}
                    style={{
                      background: inProgressYellow,
                      marginRight: units(1),
                      marginLeft: units(1),
                    }}
                  >
                    <IconPause />
                    <FormattedMessage
                      id="reportDesigner.pause"
                      defaultMessage="Pause"
                    />
                  </Button>
                </Tooltip> : null }
              <MediaStatus
                media={media}
                readonly={media.archived || media.last_status_obj.locked || options.state === 'published'}
                callback={this.statusCallback.bind(this)}
              />
            </div>
          </div>

          <StyledTwoColumnLayout>
            <ContentColumn className="column">
              <h2>
                <FormattedMessage
                  id="reportDesigner.preview"
                  defaultMessage="Report Preview"
                />
              </h2>
              { empty ?
                <div>
                  <FormattedMessage
                    id="reportDesigner.nothingToPreview"
                    defaultMessage="Start creating your report to preview what users will see when they receive it."
                  />
                </div> :
                <div id="preview">
                  { options.use_introduction ?
                    <div className="text-preview">
                      {mediaPreview}
                      <ParsedText text={this.previewIntroduction()} />
                    </div> : null }
                  { options.use_visual_card ?
                    <div id="image-preview">
                      <ReportImagePreview
                        style={{
                          width: 500,
                          height: 500,
                        }}
                        image={this.state.image}
                        teamAvatar={media.team.avatar}
                        params={options}
                        template={media.team.get_report_design_image_template}
                      />
                    </div> : null }
                  { options.use_text_message ?
                    <div className="text-preview">
                      <ParsedText text={options.text} />
                      { options.use_disclaimer ?
                        <div id="disclaimer-preview">
                          <ParsedText text={options.disclaimer} />
                        </div> : null }
                    </div> : null }
                </div> }
            </ContentColumn>
            <ContentColumn className="column" id="editor">
              <Message message={this.state.message} style={{ position: 'absolute', zIndex: 2, width: '100%' }} />
              <div id="editor-mask" className={this.state.editing ? 'disabled' : 'enabled'} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ display: 'flex', alignItems: 'center' }}>
                  <FormattedMessage
                    id="reportDesigner.reportEditorTitle"
                    defaultMessage="Select the content to send in your report"
                  />
                  <a href="http://help.checkmedia.org/en/articles/3627266-check-message-report" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                    <HelpIcon style={{ margin: '0 2px', color: checkBlue }} />
                  </a>
                </h2>
              </div>
              <div id="report-designer__customization-menu">
                <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <FormControlLabel
                      onClick={event => event.stopPropagation()}
                      onFocus={event => event.stopPropagation()}
                      control={
                        <Checkbox
                          onChange={this.handleChange.bind(this, 'use_introduction')}
                          checked={options.use_introduction}
                        />
                      }
                      label={
                        <FormattedMessage
                          id="reportDesigner.introduction"
                          defaultMessage="Introduction"
                        />
                      }
                    />
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails style={{ display: 'block' }}>
                    <TextField
                      id="report-designer__introduction"
                      defaultValue={options.introduction}
                      onChange={this.handleChange.bind(this, 'introduction')}
                      placeholder={this.props.intl.formatMessage(messages.introductionPlaceholder)}
                      rows={10}
                      variant="outlined"
                      fullWidth
                      multiline
                    />
                    <div style={{ lineHeight: '1.5em', marginTop: units(1) }}>
                      <FormattedMessage id="reportDesigner.introductionSub" defaultMessage="Use \{\{query_date\}\} and \{\{query_message\}\} placeholders to display the original dates and the content of the original query dynamically. Use \{\{status\}\} to communicate the status of the claim." />
                      <a href="http://help.checkmedia.org/en/articles/3627266-check-message-report" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', verticalAlign: 'bottom' }}>
                        <HelpIcon style={{ margin: '0 2px', color: checkBlue }} />
                      </a>
                    </div>
                  </ExpansionPanelDetails>
                </ExpansionPanel>

                <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <FormControlLabel
                      onClick={event => event.stopPropagation()}
                      onFocus={event => event.stopPropagation()}
                      control={
                        <Checkbox
                          onChange={this.handleChange.bind(this, 'use_visual_card')}
                          checked={options.use_visual_card}
                        />
                      }
                      label={
                        <FormattedMessage
                          id="reportDesigner.visualCard"
                          defaultMessage="Visual card"
                        />
                      }
                    />
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails style={{ display: 'block' }}>
                    <div style={{ marginBottom: units(2) }}>
                      <UploadImage onImage={this.handleImage.bind(this)} onClear={this.handleClearImage.bind(this)} type="image" />
                      { media.media.picture ?
                        <p>
                          <Button onClick={this.handleDefaultImage.bind(this)}>
                            <FormattedMessage
                              id="reportDesigner.useDefaultImage"
                              defaultMessage="Use default image"
                            />
                          </Button>
                        </p> : null
                      }
                    </div>
                    <TextField
                      id="report-designer__headline"
                      defaultValue={options.headline}
                      onChange={this.handleChange.bind(this, 'headline')}
                      inputProps={{ maxLength: 85 }}
                      style={{ marginBottom: units(4) }}
                      label={
                        <FormattedMessage
                          id="reportDesigner.headline"
                          defaultMessage="Headline - {max} characters max"
                          values={{ max: 85 }}
                        />
                      }
                      fullWidth
                    />
                    <TextField
                      id="report-designer__description"
                      defaultValue={options.description}
                      onChange={this.handleChange.bind(this, 'description')}
                      inputProps={{ maxLength: 120 }}
                      style={{ marginBottom: units(4) }}
                      label={
                        <FormattedMessage
                          id="reportDesigner.description"
                          defaultMessage="Description - {max} characters max"
                          values={{ max: 120 }}
                        />
                      }
                      fullWidth
                      multiline
                      rows={2}
                    />
                    <TextField
                      id="report-designer__status"
                      defaultValue={options.status_label}
                      value={options.status_label}
                      onChange={this.handleChange.bind(this, 'status_label')}
                      inputProps={{ maxLength: 16 }}
                      style={{ marginBottom: units(4) }}
                      label={
                        <FormattedMessage
                          id="reportDesigner.statusLabel"
                          defaultMessage="Status Label - {max} characters max"
                          values={{ max: 16 }}
                        />
                      }
                      fullWidth
                    />
                    <div style={{ display: 'flex' }}>
                      <TextField
                        id="report-designer__theme-color"
                        defaultValue={options.theme_color}
                        value={options.theme_color}
                        onChange={this.handleChange.bind(this, 'theme_color')}
                        inputProps={{ maxLength: 7 }}
                        style={{ marginBottom: units(4) }}
                        label={
                          <FormattedMessage
                            id="reportDesigner.themeColor"
                            defaultMessage="Theme color"
                          />
                        }
                        fullWidth
                      />
                      <div id="theme-selector">
                        {['#afafaf', '#f83430', '#00be7a', '#a500dd', '#faa62e'].map(color => (
                          <Button
                            className="theme-color"
                            style={{ backgroundColor: color }}
                            onClick={this.handleSelectColor.bind(this, color)}
                          />
                        ))}
                      </div>
                    </div>
                    <TextField
                      id="report-designer__url"
                      defaultValue={options.url}
                      onChange={this.handleChange.bind(this, 'url')}
                      inputProps={{ maxLength: 32 }}
                      style={{ marginBottom: units(4) }}
                      label={
                        <FormattedMessage
                          id="reportDesigner.url"
                          defaultMessage="URL - {max} characters max"
                          values={{ max: 32 }}
                        />
                      }
                      fullWidth
                    />
                  </ExpansionPanelDetails>
                </ExpansionPanel>

                <ExpansionPanel TransitionProps={{ unmountOnExit: true }}>
                  <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                    <FormControlLabel
                      onClick={event => event.stopPropagation()}
                      onFocus={event => event.stopPropagation()}
                      control={
                        <Checkbox
                          onChange={this.handleChange.bind(this, 'use_text_message')}
                          checked={options.use_text_message}
                        />
                      }
                      label={
                        <FormattedMessage
                          id="reportDesigner.textMessage"
                          defaultMessage="Text message"
                        />
                      }
                    />
                  </ExpansionPanelSummary>
                  <ExpansionPanelDetails style={{ display: 'block' }}>
                    <TextField
                      id="report-designer__text"
                      defaultValue={options.text}
                      onChange={this.handleChange.bind(this, 'text')}
                      placeholder={this.props.intl.formatMessage(messages.textPlaceholder)}
                      rows={10}
                      variant="outlined"
                      fullWidth
                      multiline
                    />
                    <div>
                      <FormControlLabel
                        onClick={event => event.stopPropagation()}
                        onFocus={event => event.stopPropagation()}
                        control={
                          <Checkbox
                            onChange={this.handleChange.bind(this, 'use_disclaimer')}
                            checked={options.use_disclaimer}
                          />
                        }
                        label={
                          <FormattedMessage
                            id="reportDesigner.disclaimer"
                            defaultMessage="Disclaimer"
                          />
                        }
                      />
                    </div>
                    <TextField
                      id="report-designer__disclaimer"
                      defaultValue={options.disclaimer}
                      onChange={this.handleChange.bind(this, 'disclaimer')}
                      fullWidth
                    />
                  </ExpansionPanelDetails>
                </ExpansionPanel>
              </div>
            </ContentColumn>
          </StyledTwoColumnLayout>
          <ConfirmDialog
            open={this.state.showPublishConfirmationDialog}
            title={
              <FormattedMessage
                id="reportDesigner.confirmPublishTitle"
                defaultMessage="Ready to publish your report?"
              />
            }
            blurb={
              <FormattedMessage
                id="reportDesigner.confirmPublishText"
                defaultMessage="{demand, plural, =0 {This report will be sent to anyone who requests this item in the future while published.} one {You are about to send a report to the person who requested this item. This report will be sent to anyone who requests this item in the future while published.} other {You are about to send a report to # people who requested this item. This report will be sent to anyone who requests this item in the future while published.}}"
                values={{ demand: media.demand }}
              />
            }
            handleClose={this.handleCloseDialogs.bind(this)}
            handleConfirm={this.handlePublishConfirmed.bind(this)}
          />
          <ConfirmDialog
            open={this.state.showPauseConfirmationDialog}
            title={
              <FormattedMessage
                id="reportDesigner.confirmPauseTitle"
                defaultMessage="You are about to pause the report"
              />
            }
            blurb={
              <FormattedMessage
                id="reportDesigner.confirmPauseText"
                defaultMessage="This report will not be sent to users until it is published again. Do you want to continue?"
              />
            }
            handleClose={this.handleCloseDialogs.bind(this)}
            handleConfirm={this.handlePauseConfirmed.bind(this)}
          />
          <ConfirmDialog
            open={this.state.showRepublishConfirmationDialog}
            title={
              <FormattedMessage
                id="reportDesigner.confirmRepublishTitle"
                defaultMessage="Ready to publish your changes?"
              />
            }
            blurb={
              <strong>
                <FormattedMessage
                  id="reportDesigner.confirmRepublishText"
                  defaultMessage="In the future your changes will be published to all users who request this item."
                />
              </strong>
            }
            handleClose={this.handleCloseDialogs.bind(this)}
            handleConfirm={this.handleRepublishConfirmed.bind(this)}
          >
            { media.demand > 0 ?
              <FormControlLabel
                onClick={event => event.stopPropagation()}
                onFocus={event => event.stopPropagation()}
                control={<Checkbox id="republish-and-resend" />}
                label={
                  <FormattedMessage
                    id="reportDesigner.republishAndResend"
                    defaultMessage="{demand, plural, =0 {None} one {Also send correction to the user who already received the previous version of this report} other {Also send correction to the # users who already received the previous version of this report}}"
                    values={{ demand: media.demand }}
                  />
                }
              /> : null }
          </ConfirmDialog>
          <ConfirmDialog
            open={this.state.showRepublishResendConfirmationDialog}
            title={
              <FormattedMessage
                id="reportDesigner.confirmRepublishResendTitle"
                defaultMessage="Ready to publish your correction?"
              />
            }
            blurb={
              <strong>
                <FormattedMessage
                  id="reportDesigner.confirmRepublishResendText"
                  defaultMessage="{demand, plural, =0 {In the future, a user who requests the item will receive this new version.} one {Your correction will be sent to the user who have received the previous report. In the future, a user who requests the item will receive this new version.} other {Your correction will be sent to the # users who have received the previous report. In the future, a user who requests the item will receive this new version.}}"
                  values={{ demand: media.demand }}
                />
              </strong>
            }
            handleClose={this.handleCloseDialogs.bind(this)}
            handleConfirm={this.handleRepublishResendConfirmed.bind(this)}
          />
        </StyledContainer>
      </PageTitle>
    );
  }
}

const ReportDesignerContainer = Relay.createContainer(ReportDesignerComponent, {
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
        oembed_metadata
        metadata
        title
        demand
        description
        verification_statuses
        last_status
        first_smooch_request: annotations(first: 1, annotation_type: "smooch") {
          edges {
            node {
              created_at
              content
            }
          }
        }
        media {
          picture
        }
        last_status_obj {
          id
          dbid
          locked
          content
        }
        dynamic_annotation_report_design {
          id
          dbid
          data
        }
        team {
          name
          slug
          avatar
          get_disclaimer
          get_introduction
          get_use_disclaimer
          get_use_introduction
          get_report_design_image_template
          contacts(first: 1) {
            edges {
              node {
                web
              }
            }
          }
        }
      }
    `,
  },
});

const ReportDesigner = (props) => {
  const ids = `${props.params.mediaId},${props.params.projectId}`;
  const route = new MediaRoute({ ids });

  return (
    <RelayContainer
      Component={ReportDesignerContainer}
      route={route}
      renderFetched={data => <ReportDesignerContainer {...props} {...data} />}
    />
  );
};

ReportDesigner.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

export default injectIntl(ReportDesigner);
