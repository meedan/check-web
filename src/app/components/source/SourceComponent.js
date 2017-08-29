import React, { Component } from 'react';
import Relay from 'react-relay';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedHTMLMessage,
  FormattedDate,
  defineMessages,
  injectIntl,
  intlShape,
} from 'react-intl';
import AutoComplete from 'material-ui/AutoComplete';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardActions, CardHeader, CardText } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import { Tabs, Tab } from 'material-ui/Tabs';
import Popover from 'material-ui/Popover';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/MenuItem';
import MdCancel from 'react-icons/lib/md/cancel';
import MDEdit from 'react-icons/lib/md/edit';
import AccountCard from './AccountCard';
import AccountChips from './AccountChips';
import SourceLanguages from './SourceLanguages';
import SourceTags from './SourceTags';
import Annotations from '../annotations/Annotations';
import PageTitle from '../PageTitle';
import Medias from '../media/Medias';
import MediaUtil from '../media/MediaUtil';
import Message from '../Message';
import Can from '../Can';
import CheckContext from '../../CheckContext';
import ContentColumn from '../layout/ContentColumn';
import ParsedText from '../ParsedText';
import UploadImage from '../UploadImage';
import { truncateLength } from '../../helpers';
import globalStrings from '../../globalStrings';
import CreateDynamicMutation from '../../relay/CreateDynamicMutation';
import UpdateDynamicMutation from '../../relay/UpdateDynamicMutation';
import DeleteDynamicMutation from '../../relay/DeleteDynamicMutation';
import CreateTagMutation from '../../relay/CreateTagMutation';
import DeleteTagMutation from '../../relay/DeleteTagMutation';
import CreateAccountSourceMutation from '../../relay/mutation/CreateAccountSourceMutation';
import DeleteAccountSourceMutation from '../../relay/mutation/DeleteAccountSourceMutation';
import UpdateSourceMutation from '../../relay/UpdateSourceMutation';
import UpdateProjectSourceMutation from '../../relay/mutation/UpdateProjectSourceMutation';
import Pusher from 'pusher-js';
import deepEqual from 'deep-equal';
import capitalize from 'lodash.capitalize';
import LinkifyIt from 'linkify-it';
import styled from 'styled-components';
import SourcePicture from './SourcePicture';

const FlexRow = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const messages = defineMessages({
  addInfo: {
    id: 'sourceComponent.addInfo',
    defaultMessage: 'Add Info',
  },
  editError: {
    id: 'sourceComponent.editError',
    defaultMessage: 'Sorry, could not edit the source',
  },
  createTagError: {
    id: 'sourceComponent.createTagError',
    defaultMessage: 'Failed to create tag',
  },
  selectLanguageError: {
    id: 'sourceComponent.selectLanguageError',
    defaultMessage: 'Please select a language from the list',
  },
  editSuccess: {
    id: 'sourceComponent.editSuccess',
    defaultMessage: 'Source information updated successfully!',
  },
  mergeSource: {
    id: 'sourceComponent.mergeSource',
    defaultMessage: 'Merge Source',
  },
  sourceName: {
    id: 'sourceComponent.sourceName',
    defaultMessage: 'Source name',
  },
  sourceBio: {
    id: 'sourceComponent.sourceBio',
    defaultMessage: 'Source bio',
  },
  phone: {
    id: 'sourceComponent.phone',
    defaultMessage: 'Phone',
  },
  organization: {
    id: 'sourceComponent.organization',
    defaultMessage: 'Organization',
  },
  otherDialogTitle: {
    id: 'sourceComponent.otherDialogTitle',
    defaultMessage: 'Custom Metadata Field',
  },
  label: {
    id: 'sourceComponent.label',
    defaultMessage: 'Label',
  },
  value: {
    id: 'sourceComponent.value',
    defaultMessage: 'Value',
  },
  languages: {
    id: 'sourceComponent.languages',
    defaultMessage: 'Languages',
  },
  location: {
    id: 'sourceComponent.location',
    defaultMessage: 'Location',
  },
  link: {
    id: 'sourceComponent.link',
    defaultMessage: 'Link',
  },
  addLink: {
    id: 'sourceComponent.addLink',
    defaultMessage: 'Add a link',
  },
  addLinkHelper: {
    id: 'sourceComponent.addLinkHelper',
    defaultMessage: 'Add a link to a web page or social media profile',
  },
  invalidLink: {
    id: 'sourceComponent.invalidLink',
    defaultMessage: 'Please enter a valid URL',
  },
  other: {
    id: 'sourceComponent.other',
    defaultMessage: 'Other (Specify)',
  },
});

class SourceComponent extends Component {

  constructor(props) {
    super(props);

    this.state = {
      dialogOpen: false,
      message: null,
      isEditing: false,
      metadata: this.getMetadataFields(),
      submitDisabled: false,
      showTab: 'media',
    };
  }

  componentDidMount() {
    this.setContextSource();
    this.subscribe();
  }

  componentDidUpdate() {
    this.setContextSource();
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  subscribe() {
    const that = this;
    const pusher = this.getContext().pusher;
    const pusherChannel = this.props.source.source.pusher_channel;
    if (pusher && pusherChannel) {
      pusher.subscribe(pusherChannel).bind('source_updated', (data) => {
        that.props.relay.forceFetch();
      });
    }
  }

  unsubscribe() {
    const pusher = this.getContext().pusher;
    if (pusher) {
      pusher.unsubscribe(this.props.source.source.pusher_channel);
    }
  }

  getContext() {
    const context = new CheckContext(this).getContextStore();
    return context;
  }

  setContextSource() {
    const context = new CheckContext(this);
    const store = this.getContext();
    const { team, project_id } = this.props.source;

    if (!store.team || store.team.slug !== team.slug) {
      context.setContextStore({ team });
    }

    if (!store.project || store.project.dbid !== project_id) {
      context.setContextStore({ project: { dbid: project_id } });
    }
  }

  isProjectSource() {
    return !!this.props.source.source;
  }

  getSource() {
    const { source } = this.isProjectSource() ? this.props.source : this.props;
    return source;
  }

  getMetadataAnnotation() {
    const source = this.getSource();
    const metadata = source.annotations.edges.find(item => item.node && item.node.annotation_type === 'metadata');
    return metadata && metadata.node ? metadata.node : null;
  }

  getMetadataFields() {
    const metadata = this.getMetadataAnnotation();
    const content = metadata && metadata.content ? JSON.parse(metadata.content) : [];
    return content[0] && content[0].value ? JSON.parse(content[0].value) : null;
  }

  handleAddInfoMenu = (event) => {
    event.preventDefault();

    this.setState({
      menuOpen: true,
      anchorEl: event.currentTarget,
    });
  };

  handleAddMetadataField = (type) => {
    const metadata = this.state.metadata ? Object.assign({}, this.state.metadata) : {};
    if (!metadata[type]) { metadata[type] = ''; }
    this.setState({ metadata, menuOpen: false });
  };

  handleAddCustomField() {
    const metadata = this.state.metadata ? Object.assign({}, this.state.metadata) : {};
    if (!metadata.other) { metadata.other = []; }
    metadata.other.push({ label: this.state.customFieldLabel, value: this.state.customFieldValue });
    this.setState({ metadata, dialogOpen: false });
  }

  handleAddTags = () => {
    this.setState({ addingTags: true, menuOpen: false });
  };

  handleAddLanguages = () => {
    this.setState({ addingLanguages: true, menuOpen: false });
  };

  handleAddLink = () => {
    const links = this.state.links ? this.state.links.slice(0) : [];
    const newEntry = {};
    newEntry.url = '';
    newEntry.error = '';
    links.push(newEntry);
    this.setState({ links, menuOpen: false });
  };

  handleOpenDialog() {
    this.setState({ dialogOpen: true, menuOpen: false, customFieldLabel: '', customFieldValue: '' });
  }

  handleCloseDialog() {
    this.setState({ dialogOpen: false, customFieldLabel: '', customFieldValue: '' });
  }

  handleRemoveLink = (id) => {
    const deleteLinks = this.state.deleteLinks ? this.state.deleteLinks.slice(0) : [];
    deleteLinks.push(id);
    this.setState({ deleteLinks });
  };

  handleRemoveNewLink = (index) => {
    const links = this.state.links ? this.state.links.slice(0) : [];
    links.splice(index, 1);
    this.setState({ links });
  };

  handleRequestClose() {
    this.setState({
      menuOpen: false,
    });
  }

  handleEditProfileImg = () => {
    this.setState({ editProfileImg: true });
  };

  handleTabChange = (value) => {
    this.setState({
      showTab: value,
    });
  };

  handleEnterEditMode(e) {
    this.setState({
      isEditing: true,
      addingTags: false,
      addingLanguages: false,
      editProfileImg: false,
      message: null,
      tagErrorMessage: null,
      languageErrorMessage: null,
      submitDisabled: false,
      links: [],
      deleteLinks: [],
    });
    e.preventDefault();
  }

  handleLeaveEditMode() {
    this.setState({
      isEditing: false,
      message: null,
      metadata: this.getMetadataFields(),
    });
    this.onClear();
  }

  handleChangeLink(e, index) {
    const links = this.state.links ? this.state.links.slice(0) : [];
    links[index].url = e.target.value;
    links[index].error = '';
    this.setState({ links });
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.validateLinks() && !this.state.submitDisabled) {
      const updateSourceSent = this.updateSource();
      const updateLinksSent = this.updateLinks();
      const updateMetadataSent = this.updateMetadata();
      const isEditing = updateSourceSent || updateLinksSent || updateMetadataSent;

      this.setState({ isEditing, submitDisabled: true, hasFailure: false, message: null });
    }
  }

  handleSelectTag = (chosenRequest, index) => {
    this.createTag(chosenRequest);
  };

  fail = (transaction) => {
    const error = transaction.getError();
    let message = this.props.intl.formatMessage(messages.editError);
    try {
      const json = JSON.parse(error.source);
      if (json.error) {
        message = json.error;
      }
    } catch (e) { }
    this.setState({ message, hasFailure: true, submitDisabled: false });
  };

  success = (response, mutation) => {
    const manageEditingState = () => {
      const submitDisabled = this.state.pendingMutations.length > 0;
      const isEditing = (submitDisabled || this.state.hasFailure);
      const message = isEditing ? this.state.message : null;

      this.setState({ isEditing, submitDisabled, message });
    };

    const pendingMutations = this.state.pendingMutations ? this.state.pendingMutations.slice(0) : [];
    this.setState({ pendingMutations: pendingMutations.filter(m => m !== mutation) }, manageEditingState);
  };

  registerPendingMutation = (mutation) => {
    const pendingMutations = this.state.pendingMutations ? this.state.pendingMutations.slice(0) : [];
    pendingMutations.push(mutation);
    this.setState({ pendingMutations });
  };

  createDynamicAnnotation(annotated, annotated_id, annotated_type, value) {
    const onFailure = (transaction) => { this.fail(transaction); };
    const onSuccess = (response) => { this.success(response, 'createMetadata'); };
    const context = this.getContext();
    const annotator = context.currentUser;
    const fields = {};
    fields.metadata_value = JSON.stringify(value);

    this.registerPendingMutation('createMetadata');

    Relay.Store.commitUpdate(
      new CreateDynamicMutation({
        parent_type: annotated_type.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
        annotator,
        annotated,
        context,
        annotation: {
          fields,
          annotation_type: 'metadata',
          annotated_type,
          annotated_id,
        },
      }),
      { onSuccess, onFailure },
    );
  }

  updateDynamicAnnotation(annotated, annotation_id, value) {
    const onFailure = (transaction) => { this.fail(transaction); };
    const onSuccess = (response) => { this.success(response, 'updateMetadata'); };
    const fields = {};
    fields.metadata_value = JSON.stringify(value);

    this.registerPendingMutation('updateMetadata');

    Relay.Store.commitUpdate(
      new UpdateDynamicMutation({
        annotated,
        dynamic: {
          id: annotation_id,
          fields,
        },
      }),
      { onSuccess, onFailure },
    );
  }

  createTag(tagString) {
    const { source } = this.props;
    const context = new CheckContext(this).getContextStore();

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let tagErrorMessage = this.props.intl.formatMessage(messages.createTagError);

      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          tagErrorMessage = json.error;
        }
      } catch (e) { }

      this.setState({ tagErrorMessage, hasFailure: true, submitDisabled: false });
    };

    const onSuccess = (response) => { this.setState({ tagErrorMessage: null }); };

    const tagsList = [...new Set(tagString.split(','))];

    tagsList.forEach((tag) => {
      Relay.Store.commitUpdate(
        new CreateTagMutation({
          annotated: source,
          annotator: context.currentUser,
          parent_type: 'project_source',
          context,
          annotation: {
            tag: tag.trim(),
            annotated_type: 'ProjectSource',
            annotated_id: source.dbid,
          },
        }),
        { onSuccess, onFailure },
      );
    });
  }

  deleteTag(tagId) {
    const { source } = this.props;
    const onFailure = (transaction) => { this.fail(transaction); };
    const onSuccess = (response) => {};

    Relay.Store.commitUpdate(
      new DeleteTagMutation({
        annotated: source,
        parent_type: 'project_source',
        id: tagId,
      }),
      { onSuccess, onFailure },
    );
  }

  createAccountSource(url) {
    const source = this.getSource();

    const onFailure = (transaction) => {
      const links = this.state.links ? this.state.links.slice(0) : [];
      const index = links.findIndex(link => link.url === url);

      if (index > -1) {
        const error = transaction.getError();
        let message = this.props.intl.formatMessage(messages.invalidLink);
        try {
          const json = JSON.parse(error.source);
          if (json.error) {
            message = json.error;
          }
        } catch (e) { }

        links[index].error = message;
      }

      this.setState({ hasFailure: true, submitDisabled: false });
    };

    const onSuccess = (response) => { this.success(response, 'createAccount'); };

    if (!url) { return; }

    this.registerPendingMutation('createAccount');

    Relay.Store.commitUpdate(
      new CreateAccountSourceMutation({
        id: source.dbid,
        url,
        source,
      }),
      { onSuccess, onFailure },
    );
  }

  deleteAccountSource(asId) {
    const source = this.getSource();
    const onFailure = (transaction) => { this.fail(transaction); };
    const onSuccess = (response) => { this.success(response, 'deleteAccount'); };

    this.registerPendingMutation('deleteAccount');

    Relay.Store.commitUpdate(
      new DeleteAccountSourceMutation({
        id: asId,
        source,
      }),
      { onSuccess, onFailure },
    );
  }

  validateLinks() {
    const linkify = new LinkifyIt();

    let success = true;

    let links = this.state.links ? this.state.links.slice(0) : [];
    links = links.filter(link => !!link.url.trim());

    links.forEach((item) => {
      const url = linkify.match(item.url);
      if (Array.isArray(url) && url[0] && url[0].url) {
        item.url = url[0].url;
      } else {
        item.error = this.props.intl.formatMessage(messages.invalidLink);
        success = false;
      }
    });

    this.setState({ links, submitDisabled: false });
    return success;
  }

  updateLinks() {
    let links = this.state.links ? this.state.links.slice(0) : [];
    links = links.filter(link => !!link.url.trim());

    const deleteLinks = this.state.deleteLinks ? this.state.deleteLinks.slice(0) : [];

    if (!links.length && !deleteLinks.length) {
      return false;
    }

    links.forEach((link) => { this.createAccountSource(link.url); });
    deleteLinks.forEach((id) => { this.deleteAccountSource(id); });

    return true;
  }

  updateMetadata() {
    const source = this.getSource();
    const metadata = this.state.metadata ? Object.assign({}, this.state.metadata) : {};
    const metadataAnnotation = this.getMetadataAnnotation();

    if (deepEqual(metadata, this.getMetadataFields())) {
      return false;
    }

    if (metadataAnnotation) {
      this.updateDynamicAnnotation(source, metadataAnnotation.id, metadata);
    } else {
      this.createDynamicAnnotation(source, source.dbid, 'Source', metadata);
    }

    return true;
  }

  updateSource() {
    const source = this.getSource();
    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.editError);

      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }

      this.setState({ message, hasFailure: true, submitDisabled: false });
    };
    const onSuccess = (response) => { this.success(response, 'updateSource'); };
    const form = document.forms['edit-source-form'];

    if (source.name === form.name.value && source.description === form.description.value && !form.image) {
      return false;
    }

    this.registerPendingMutation('updateSource');

    Relay.Store.commitUpdate(
      new UpdateSourceMutation({
        source: {
          id: source.id,
          name: form.name.value,
          image: form.image,
          description: form.description.value,
        },
      }),
      { onSuccess, onFailure },
    );

    return true;
  }

  labelForType(type) {
    switch (type) {
    case 'phone':
      return this.props.intl.formatMessage(messages.phone);
    case 'organization':
      return this.props.intl.formatMessage(messages.organization);
    case 'location':
      return this.props.intl.formatMessage(messages.location);
    }
  }

  onImage(file) {
    document.forms['edit-source-form'].image = file;
    this.setState({ image: file });
  }

  onClear = () => {
    if (document.forms['edit-source-form']) {
      document.forms['edit-source-form'].image = null;
    }

    this.setState({ image: null });
  };

  onImageError(file, message) {
    this.setState({ message, image: null });
  }

  renderAccountsEdit() {
    if (!this.isProjectSource()) { return; }

    const source = this.getSource();
    const links = this.state.links ? this.state.links.slice(0) : [];
    const deleteLinks = this.state.deleteLinks ? this.state.deleteLinks.slice(0) : [];
    const showAccounts = source.account_sources.edges.filter(as => (deleteLinks.indexOf(as.node.id) < 0));

    return <div key="renderAccountsEdit">
      { showAccounts.map((as, index) =>
        <div key={as.node.id} className="source__url">
          <FlexRow>
            <TextField
              id={`source__link-item${index.toString()}`}
              defaultValue={as.node.account.url}
              floatingLabelText={capitalize(as.node.account.provider)}
              style={{ width: '85%' }}
              disabled
            />
            <MdCancel className="create-task__remove-option-button create-task__md-icon" onClick={() => this.handleRemoveLink(as.node.id)} />
          </FlexRow>
        </div>)
      }
      { links.map((link, index) =>
        <div key={index.toString()} className="source__url-input">
          <FlexRow>
            <TextField
              id={`source__link-input${index.toString()}`}
              name={`source__link-input${index.toString()}`}
              value={link.url}
              errorText={link.error}
              floatingLabelText={this.props.intl.formatMessage(messages.addLink)}
              onChange={e => this.handleChangeLink(e, index)}
              style={{ width: '85%' }}
            />
            <MdCancel className="create-task__remove-option-button create-task__md-icon" onClick={() => this.handleRemoveNewLink(index)} />
          </FlexRow>
          { link.error
            ? null
            : <div className="source__helper">{this.props.intl.formatMessage(messages.addLinkHelper)}</div>
          }
        </div>)
      }
    </div>;
  }

  renderMetadataView() {
    if (!this.isProjectSource()) { return; }

    const metadata = this.state.metadata;

    const renderMetadataFieldView = type => metadata[type] ?
      <span className={`source__metadata-${type}`}>
        {`${this.labelForType(type)}: ${metadata[type]}`} <br />
      </span> : null;

    const renderMetadaCustomFields = () => {
      if (Array.isArray(metadata.other)) {
        return metadata.other.map((cf, index) =>
          (cf.value ? <span key={index} className={'source__metadata-other'}>
            {`${cf.label}: ${cf.value}`} <br />
          </span> : null),
        );
      }
    };

    if (metadata) {
      return (<div className="source__metadata">
        { renderMetadataFieldView('phone') }
        { renderMetadataFieldView('organization') }
        { renderMetadataFieldView('location') }
        { renderMetadaCustomFields() }
      </div>
      );
    }
  }

  renderMetadataEdit() {
    if (!this.isProjectSource()) { return; }

    const metadata = this.state.metadata;

    const handleChangeField = (type, e) => {
      const metadata = this.state.metadata ? Object.assign({}, this.state.metadata) : {};
      metadata[type] = e.target.value;
      this.setState({ metadata });
    };

    const handleRemoveField = (type) => {
      const metadata = this.state.metadata ? Object.assign({}, this.state.metadata) : {};
      delete metadata[type];
      this.setState({ metadata });
    };

    const handleChangeCustomField = (index, e) => {
      const metadata = this.state.metadata ? Object.assign({}, this.state.metadata) : {};
      metadata.other[index].value = e.target.value;
      this.setState({ metadata });
    };

    const handleRemoveCustomField = (index) => {
      const metadata = this.state.metadata ? Object.assign({}, this.state.metadata) : {};
      metadata.other.splice(index, 1);
      this.setState({ metadata });
    };

    const renderMetadataFieldEdit = type => metadata.hasOwnProperty(type) ? <div className={`source__metadata-${type}-input`}>
      <FlexRow>
        <TextField
          defaultValue={metadata[type]}
          floatingLabelText={this.labelForType(type)}
          style={{ width: '85%' }}
          onChange={(e) => { handleChangeField(type, e); }}
        />
        <MdCancel className="create-task__remove-option-button create-task__md-icon" onClick={handleRemoveField.bind(this, type)} />
      </FlexRow>
    </div> : null;

    const renderMetadaCustomFieldsEdit = () => {
      if (Array.isArray(metadata.other)) {
        return metadata.other.map((cf, index) =>
          <div key={index} className={'source__metadata-other-input'}>
            <FlexRow>
              <TextField
                defaultValue={cf.value}
                floatingLabelText={cf.label}
                style={{ width: '85%' }}
                onChange={(e) => { handleChangeCustomField(index, e); }}
              />
              <MdCancel className="create-task__remove-option-button create-task__md-icon" onClick={handleRemoveCustomField.bind(this, index)} />
            </FlexRow>
          </div>);
      }
    };

    if (metadata) {
      return (<div className="source__metadata">
        { renderMetadataFieldEdit('phone') }
        { renderMetadataFieldEdit('organization') }
        { renderMetadataFieldEdit('location') }
        { renderMetadaCustomFieldsEdit() }
      </div>
      );
    }
  }

  renderLanguagesView() {
    if (!this.isProjectSource()) { return; }

    return <SourceLanguages usedLanguages={this.props.source.languages.edges} />;
  }

  renderLanguagesEdit() {
    if (!this.isProjectSource()) { return; }

    const createLanguageAnnotation = (value) => {
      if (!value) {
        this.setState({ languageErrorMessage: this.props.intl.formatMessage(messages.selectLanguageError) });
        return;
      }

      const onFailure = (transaction) => {
        const error = transaction.getError();
        let languageErrorMessage = this.props.intl.formatMessage(messages.createTagError);

        try {
          const json = JSON.parse(error.source);
          if (json.error) {
            languageErrorMessage = json.error;
          }
        } catch (e) { }

        this.setState({ languageErrorMessage, hasFailure: true, submitDisabled: false });
      };

      const onSuccess = (response) => { this.setState({ languageErrorMessage: null }); };
      const context = this.getContext();
      const annotator = context.currentUser;
      const project_source = this.props.source;
      const fields = {};
      fields.language = value;

      Relay.Store.commitUpdate(
        new CreateDynamicMutation({
          parent_type: 'project_source',
          annotator,
          annotated: project_source,
          context,
          annotation: {
            fields,
            annotation_type: 'language',
            annotated_type: 'ProjectSource',
            annotated_id: project_source.dbid,
          },
        }),
        { onSuccess, onFailure },
      );
    };

    const deleteLanguageAnnotation = (id) => {
      const { source } = this.props;
      const onFailure = (transaction) => { this.fail(transaction); };
      const onSuccess = (response) => {};

      Relay.Store.commitUpdate(
        new DeleteDynamicMutation({
          annotated: source,
          parent_type: 'project_source',
          id,
        }),
        { onSuccess, onFailure },
      );
    };

    const languageSelect = (lang) => {
      createLanguageAnnotation(lang.value);
    };

    const languages = this.props.source.languages.edges;
    const isEditing = this.state.addingLanguages || languages.length;

    return (
      <SourceLanguages
        errorText={this.state.languageErrorMessage}
        usedLanguages={languages}
        projectLanguages={this.props.source.project.get_languages}
        onDelete={deleteLanguageAnnotation}
        onSelect={languageSelect}
        isEditing={isEditing}
      />
    );
  }

  renderTagsView() {
    if (!this.isProjectSource()) { return; }

    const tags = this.props.source.tags.edges;
    return <SourceTags tags={tags} />;
  }

  renderTagsEdit() {
    if (!this.isProjectSource()) { return; }

    const tags = this.props.source.tags.edges;
    const tagLabels = tags.map(tag => tag.node.tag);
    const suggestedTags = (this.props.source.team && this.props.source.team.get_suggested_tags) ? this.props.source.team.get_suggested_tags.split(',') : [];
    const availableTags = suggestedTags.filter(suggested => !tagLabels.includes(suggested));
    const isEditing = this.state.addingTags || tags.length;

    return (
      <SourceTags
        errorText={this.state.tagErrorMessage}
        tags={tags}
        options={availableTags}
        onDelete={this.deleteTag.bind(this)}
        onSelect={this.handleSelectTag}
        isEditing={isEditing}
      />
    );
  }

  renderSourceView(source, isProjectSource) {
    return (
      <div className="source__profile-content">
        <section className="layout-two-column">
          <div className="column-secondary">
            <SourcePicture object={source} type="source" className="source__avatar" />
          </div>

          <div className="column-primary">
            <div className="source__primary-info">
              <h1 className="source__name">
                {source.name}
              </h1>
              <div className="source__description">
                <p className="source__description-text">
                  <ParsedText text={truncateLength(source.description, 600)} />
                </p>
              </div>
            </div>

            { isProjectSource ? <AccountChips accounts={source.account_sources.edges.map(as => as.node.account)} /> : null }

            { isProjectSource ?
              <div className="source__contact-info">
                <FormattedHTMLMessage
                  id="sourceComponent.dateAdded" defaultMessage="Added {date} &bull; Source of {number} links"
                  values={{
                    date: this.props.intl.formatDate(MediaUtil.createdAt({ published: source.created_at }), { year: 'numeric', month: 'short', day: '2-digit' }),
                    number: source.medias.edges.length || '0',
                  }}
                />
              </div> : null
              }

            { this.renderTagsView() }
            { this.renderLanguagesView() }
            { this.renderMetadataView() }

          </div>
        </section>
        { isProjectSource ?
          <Tabs value={this.state.showTab} onChange={this.handleTabChange}>
            <Tab
              label={<FormattedMessage id="sourceComponent.medias" defaultMessage="Media" />}
              value="media"
              className="source__tab-button-media"
            />
            <Tab
              label={<FormattedMessage id="sourceComponent.notes" defaultMessage="Notes" />}
              className="source__tab-button-notes"
              value="annotation"
            />
            <Tab
              label={<FormattedMessage id="sourceComponent.network" defaultMessage="Networks" />}
              value="account"
              className="source__tab-button-account"
            />
          </Tabs> : <CardActions />
          }
      </div>
    );
  }

  renderSourceEdit(source) {
    const avatarPreview = this.state.image && this.state.image.preview;

    const actions = [
      <FlatButton label={this.props.intl.formatMessage(globalStrings.cancel)} onClick={this.handleCloseDialog.bind(this)} />,
      <FlatButton label={<FormattedMessage id="sourceComponent.add" defaultMessage="Add Field" />} onClick={this.handleAddCustomField.bind(this)} primary disabled={!this.state.customFieldLabel} />,
    ];

    return (
      <div className="source__profile-content">
        <section className="layout-two-column">
          <div className="column-secondary">
            <div
              className="source__avatar"
              style={{ backgroundImage: `url(${avatarPreview || source.image})` }}
            />
            { !this.state.editProfileImg ?
              <div className="source__edit-avatar-button">
                <FlatButton
                  label={this.props.intl.formatMessage(globalStrings.edit)}
                  onClick={this.handleEditProfileImg.bind(this)}
                  primary
                />
              </div> : null
            }
          </div>

          <div className="column-primary">
            <form onSubmit={this.handleSubmit.bind(this)} name="edit-source-form">
              { this.state.editProfileImg ?
                <UploadImage onImage={this.onImage.bind(this)} onClear={this.onClear} onError={this.onImageError.bind(this)} noPreview /> : null
              }
              <TextField
                className="source__name-input"
                name="name"
                id="source__name-container"
                defaultValue={source.name}
                floatingLabelText={this.props.intl.formatMessage(messages.sourceName)}
                style={{ width: '85%' }}
              />
              <TextField
                className="source__bio-input"
                name="description"
                id="source__bio-container"
                defaultValue={source.description}
                floatingLabelText={this.props.intl.formatMessage(messages.sourceBio)}
                multiLine
                rowsMax={4}
                style={{ width: '85%' }}
              />

              { this.renderAccountsEdit() }
              { this.renderTagsEdit() }
              { this.renderLanguagesEdit() }
              { this.renderMetadataEdit() }
            </form>

            <div className="source__edit-buttons">
              <div className="source__edit-buttons-add-merge">
                <FlatButton
                  className="source__edit-addinfo-button"
                  primary
                  onClick={this.handleAddInfoMenu}
                  label={this.props.intl.formatMessage(messages.addInfo)}
                />
                <Popover open={this.state.menuOpen} anchorEl={this.state.anchorEl} anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }} targetOrigin={{ horizontal: 'left', vertical: 'top' }} onRequestClose={this.handleRequestClose.bind(this)}>
                  <Menu>
                    <MenuItem className="source__add-phone" onClick={this.handleAddMetadataField.bind(this, 'phone')} primaryText={this.props.intl.formatMessage(messages.phone)} />
                    <MenuItem className="source__add-organization" onClick={this.handleAddMetadataField.bind(this, 'organization')} primaryText={this.props.intl.formatMessage(messages.organization)} />
                    <MenuItem className="source__add-location" onClick={this.handleAddMetadataField.bind(this, 'location')} primaryText={this.props.intl.formatMessage(messages.location)} />
                    <MenuItem className="source__add-tags" onClick={this.handleAddTags.bind(this)} primaryText={this.props.intl.formatMessage(globalStrings.tags)} />
                    <MenuItem className="source__add-languages" onClick={this.handleAddLanguages.bind(this)} primaryText={this.props.intl.formatMessage(messages.languages)} />
                    <MenuItem className="source__add-link" onClick={this.handleAddLink.bind(this)} primaryText={this.props.intl.formatMessage(messages.link)} />
                    <MenuItem className="source__add-other" onClick={this.handleOpenDialog.bind(this)} primaryText={this.props.intl.formatMessage(messages.other)} />
                  </Menu>
                </Popover>
              </div>

              <Dialog title={this.props.intl.formatMessage(messages.otherDialogTitle)} actions={actions} actionsContainerClassName="sourceComponent__action-container" open={this.state.dialogOpen} onRequestClose={this.handleCloseDialog.bind(this)} contentStyle={{ width: '608px' }}>
                <TextField
                  id="source__other-label-input"
                  floatingLabelText={this.props.intl.formatMessage(messages.label)}
                  fullWidth
                  onChange={(e) => { this.setState({ customFieldLabel: e.target.value }); }}
                />
                <TextField
                  id="source__other-value-input"
                  floatingLabelText={this.props.intl.formatMessage(messages.value)}
                  onChange={(e) => { this.setState({ customFieldValue: e.target.value }); }}
                  fullWidth
                />
              </Dialog>

              <div className="source__edit-buttons-cancel-save">
                <FlatButton
                  className="source__edit-cancel-button"
                  onClick={this.handleLeaveEditMode.bind(this)}
                  label={this.props.intl.formatMessage(globalStrings.cancel)}
                />
                <RaisedButton
                  className="source__edit-save-button"
                  primary
                  onClick={this.handleSubmit.bind(this)}
                  label={this.props.intl.formatMessage(globalStrings.save)}
                />
              </div>
              <div className="source__edit-buttons-clear" />
            </div>
          </div>
        </section>
      </div>
    );
  }

  render() {
    const isProjectSource = this.isProjectSource();
    const source = this.getSource();
    const isEditing = this.state.isEditing;
    return (
      <PageTitle prefix={source.name} skipTeam={false} team={this.props.source.team}>
        <div className="source" data-id={source.dbid} data-user-id={source.user_id}>
          <Card className="source__profile source__profile--editing">
            <ContentColumn>
              <Message message={this.state.message} />
              { isEditing ?
                  this.renderSourceEdit(source, isProjectSource) :
                  this.renderSourceView(source, isProjectSource)
              }
            </ContentColumn>
            { !isEditing ?
              <section className="layout-fab-container">
                <Can
                  permissions={source.permissions}
                  permission="update Source"
                >
                  <IconButton
                    className="source__edit-button"
                    tooltip={
                      <FormattedMessage
                        id="sourceComponent.editButton"
                        defaultMessage="Edit profile"
                      />
                    }
                    tooltipPosition="top-center"
                    onTouchTap={this.handleEnterEditMode.bind(this)}
                  >
                    <MDEdit />
                  </IconButton>
                </Can>
              </section> : null
            }
          </Card>

          { !isEditing ?
            <div>
              { this.state.showTab === 'annotation' ? <Annotations annotations={source.log.edges} annotated={this.props.source} annotatedType="ProjectSource" /> : null }
              <ContentColumn>
                { this.state.showTab === 'media' ? <Medias medias={source.medias.edges} /> : null }
                { this.state.showTab === 'account' ? source.accounts.edges.map(account => <AccountCard key={account.node.id} account={account.node} />) : null }
              </ContentColumn>
            </div> : null
          }
        </div>
      </PageTitle>
    );
  }
}

SourceComponent.propTypes = {
  intl: intlShape.isRequired,
  source: PropTypes.object,
};

SourceComponent.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(SourceComponent);
