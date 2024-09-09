import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl';
import { graphql, createFragmentContainer, commitMutation as commitMutationCompat } from 'react-relay/compat';
import { commitMutation } from 'react-relay';
import { Store } from 'react-relay/classic';
import cx from 'classnames/bind';
import DeleteIcon from '../../../icons/delete.svg';
import TextField from '../../cds/inputs/TextField';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import LimitedTextArea from '../../layout/inputs/LimitedTextArea';
import ConfirmProceedDialog from '../../layout/ConfirmProceedDialog';
import NewsletterHeader from '../Newsletter/NewsletterHeader';
import NewsletterRssFeed from '../Newsletter/NewsletterRssFeed';
import { withSetFlashMessage } from '../../FlashMessage';
import inputStyles from '../../../styles/css/inputs.module.css';
import newsletterStyles from '../Newsletter/NewsletterComponent.module.css';
import settingsStyles from '../Settings.module.css';

const messages = defineMessages({
  newResource: {
    id: 'smoochBotResourceEditor.newResource',
    defaultMessage: 'Create New Resource',
    description: 'Page title for creating a new resource for the tipline bot to deliver',
  },
  editResource: {
    id: 'smoochBotResourceEditor.editResource',
    defaultMessage: 'Edit Resource',
    description: 'Page title for editing an existing resource for the tipline bot to deliver',
  },
  newResourceDescription: {
    id: 'smoochBotResourceEditor.newResourceDescription',
    defaultMessage: 'Add multimedia content as a response to a Tipline Menu option by adding a new resource.',
    description: 'Page description for adding a new tipline resource',
  },
  saveResource: {
    id: 'smoochBotResourceEditor.save',
    defaultMessage: 'Save',
    description: 'Label for action button to save a tipline resource.',
  },
  createResource: {
    id: 'smoochBotResourceEditor.create',
    defaultMessage: 'Create Resource',
    description: 'Label for action button to create a new tipline resource.',
  },
});

// Mutations

const updateMutation = graphql`
  mutation SmoochBotResourceEditorUpdateMutation($input: UpdateTiplineResourceInput!) {
    updateTiplineResource(input: $input) {
      tipline_resource {
        ...SmoochBotResourceEditor_tiplineResource
        team {
          tipline_resources(first: 10000) {
            edges {
              node {
                ...SmoochBotResourceEditor_tiplineResource
              }
            }
          }
        }
      }
    }
  }
`;

const createMutation = graphql`
  mutation SmoochBotResourceEditorCreateMutation($input: CreateTiplineResourceInput!) {
    createTiplineResource(input: $input) {
      tipline_resource {
        id
        dbid
      }
    }
  }
`;

const deleteMutation = graphql`
  mutation SmoochBotResourceEditorDestroyMutation($input: DestroyTiplineResourceInput!) {
    destroyTiplineResource(input: $input) {
      team {
        id
        tipline_resources(first: 10000) {
          edges {
            node {
              ...SmoochBotResourceEditor_tiplineResource
            }
          }
        }
      }
    }
  }
`;

const SmoochBotResourceEditorComponent = (props) => {
  const {
    environment,
    intl,
    language,
    onCreate,
    onDelete,
    setFlashMessage,
  } = props;

  // Existing resource or new resource

  const [resource, setResource] = React.useState({ ...props.resource });

  const updateResource = (changes) => { // "changes" is a hash { field => value }
    setResource({ ...resource, ...changes });
  };

  // States: File upload

  const [file, setFile] = React.useState(null);
  const fileNameFromUrl = new RegExp(/[^/\\&?]+\.\w{3,4}(?=([?&].*$|$))/);
  const [fileName, setFileName] = React.useState((resource.header_file_url && resource.header_file_url.match(fileNameFromUrl) && resource.header_file_url.match(fileNameFromUrl)[0]) || '');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // States: Form control

  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const [disableSaveNoFile, setDisableSaveNoFile] = React.useState(false);
  const [disableSaveTextTooLong, setDisableSaveTextTooLong] = React.useState(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(false);

  // Callbacks

  const handleError = (err) => {
    setSaving(false);
    if (
      err.length &&
      err[0]?.data &&
      (
        err[0]?.data.title ||
        err[0]?.data.rss_feed_url ||
        err[0]?.data.header_type ||
        err[0]?.data.header_file ||
        err[0]?.data.base
      )
    ) {
      const { data } = err[0];
      if (data.rss_feed_url && data.rss_feed_url[0] === 'is invalid') {
        data.rss_feed_url = (
          <FormattedMessage
            defaultMessage="RSS feed URL is invalid."
            description="Error message displayed when a user submits a form with a URL that the server does not recognize."
            id="smoochBotResourceEditor.errorRssFeedUrl"
          />
        );
      }
      if (data.title && data.title[0] === "can't be blank") {
        data.title = (
          <FormattedMessage
            defaultMessage="Title can't be blank"
            description="Error message displayed when a user submits a form with a blank title."
            id="smoochBotResourceEditor.errorTitle"
          />
        );
      }
      if (data.header_file && data.header_file[0].includes('cannot be of type')) {
        data.header_file = (
          <FormattedMessage
            defaultMessage="File must be of the following allowed types: {fileTypes}"
            description="Error message displayed when a user uploads a file of the wrong type. This is followed with a list of file types like 'png, jpg, jpeg, pdf'."
            id="smoochBotResourceEditor.errorHeaderFile"
            values={{
              fileTypes: data.header_file[0].split(':')[1],
            }}
          />
        );
      }
      if (data.base && data.base[0].includes('Sorry, we don\'t support')) {
        // FIXME: We are not going to internationalize this string for now, it's too unstructured and variable to make work
        data.base = data.base[0]; // eslint-disable-line prefer-destructuring
      }
      setErrors(data);
    } else if (err.length && err[0]?.message) {
      setFlashMessage(err[0].message, 'error');
    } else {
      setFlashMessage((
        <FormattedMessage
          defaultMessage="Could not save resource, please try again."
          description="Error message displayed when it's not possible to save a resource."
          id="smoochBotResourceEditor.error"
        />
      ), 'error');
    }
  };

  const refreshStore = (response) => {
    // FIXME: This is a hack... send another dummy update mutation using Relay Compat network layer in order to force an update of the Relay store
    // We can delete this once our custom Relay Modern network layer that supports file uploads is capable of refreshing the Relay store
    commitMutationCompat(
      Store,
      {
        mutation: updateMutation,
        variables: {
          input: {
            id: resource.id || response.createTiplineResource.tipline_resource.id,
          },
        },
        onCompleted: () => {
          if (response.createTiplineResource) {
            onCreate(response.createTiplineResource.tipline_resource);
          }
        },
      },
    );
  };

  const handleSuccess = (response) => {
    setSaving(false);
    setErrors({});
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Resource saved successfully."
        description="Success message displayed when a resource is saved."
        id="smoochBotResourceEditor.success"
      />
    ), 'success');
    refreshStore(response);
  };

  const handleSave = () => {
    setSaving(true);
    const mutation = (resource.id ? updateMutation : createMutation);
    const input = {
      language,
      title: resource.title,
      content: resource.content,
      header_type: resource.header_type,
      header_overlay_text: resource.header_overlay_text,
      content_type: resource.content_type,
      rss_feed_url: resource.rss_feed_url,
      number_of_articles: resource.number_of_articles,
    };
    if (resource.id) {
      input.id = resource.id;
    } else {
      input.uuid = resource.uuid;
    }
    const uploadables = {};
    if (file) {
      uploadables['file[]'] = file;
    }
    commitMutation(
      environment,
      {
        mutation,
        variables: {
          input,
        },
        uploadables,
        onCompleted: (response, err) => {
          if (err) {
            handleError(err);
          } else {
            handleSuccess(response);
          }
        },
        onError: (err) => {
          handleError(err);
        },
      },
    );
  };

  const handleDeleted = () => {
    setSaving(false);
    setErrors({});
    setFlashMessage((
      <FormattedMessage
        defaultMessage="Resource deleted successfully."
        description="Success message displayed when a resource is deleted."
        id="smoochBotResourceEditor.deleted"
      />
    ), 'success');
    onDelete();
  };

  const handleDelete = () => {
    commitMutationCompat(
      Store,
      {
        mutation: deleteMutation,
        variables: {
          input: {
            id: resource.id,
          },
        },
        onCompleted: (response, err) => {
          if (err) {
            handleError(err);
          } else {
            handleDeleted();
          }
        },
        onError: (err) => {
          handleError(err);
        },
      },
    );
  };

  const handleConfirmDelete = () => {
    setShowConfirmationDialog(true);
  };

  // Effects

  // This triggers when a file or file name or header type is changed. If the header is an attachment type, it disables saving if there is no file attached.
  React.useEffect(() => {
    const fileRequired = resource.header_type === 'image' || resource.header_type === 'audio' || resource.header_type === 'video';
    if (file && fileRequired) {
      setDisableSaveNoFile(false);
    } else if (!file && !fileName && fileRequired) {
      setDisableSaveNoFile(true);
    } else if (!fileRequired) {
      setDisableSaveNoFile(false);
    }

    // Reset any errors returned by the backend related to the previously uploaded file
    setErrors({ ...errors, header_file: null, base: null });
  }, [file, fileName, resource]);

  // This triggers when a file is changed. It rerenders the file name if a new file was attached.
  React.useEffect(() => {
    if (file && !fileName) {
      setFileName(file.name);
    }
  }, [file]);

  return (
    <div id={`resource-${resource.dbid}`}>
      <div className={settingsStyles['setting-content-container-title']}>
        <span>{resource.id ? intl.formatMessage(messages.editResource) : intl.formatMessage(messages.newResource)}</span>
      </div>
      <p>{resource.id ? null : intl.formatMessage(messages.newResourceDescription)}</p>
      <div className={settingsStyles['setting-content-container-inner']}>
        <div className={inputStyles['form-fieldset']}>
          <TextField
            className={inputStyles['form-fieldset-field']}
            defaultValue={resource.title}
            error={Boolean(errors.title)}
            helpContent={errors.title}
            id="resource__title"
            label={
              <FormattedMessage
                defaultMessage="Title"
                description="Label for tipline resource title field"
                id="smoochBotResourceEditor.title"
              />
            }
            required
            onChange={e => updateResource({ title: e.target.value })}
          />
        </div>
        <div className={cx(settingsStyles['setting-content-container-inner-accent'], inputStyles['form-fieldset'])}>
          <div className={inputStyles['form-fieldset-title']}>
            <FormattedMessage defaultMessage="Content" description="Title for the resource content section on a tipline resource settings page" id="smoochBotResourceEditor.content" />
          </div>
          <NewsletterHeader
            availableHeaderTypes={['audio', 'video', 'image', 'none', 'link_preview']}
            file={file}
            fileName={fileName}
            handleFileChange={handleFileChange}
            headerType={resource.header_type || 'link_preview'}
            key={`resource-header-${resource.id}`}
            overlayText={resource.header_overlay_text || ''}
            parentErrors={errors}
            setFile={setFile}
            setFileName={setFileName}
            onUpdateField={(fieldName, value) => {
              if (fieldName === 'headerType') {
                updateResource({ header_type: value });
              } else if (fieldName === 'overlayText') {
                updateResource({ header_overlay_text: value });
              }
            }}
          />
          <LimitedTextArea
            className={inputStyles['form-fieldset-field']}
            error={errors.content}
            helpContent={errors.content}
            key={resource.content_type}
            label={
              resource.content_type === 'rss' ?
                <FormattedMessage
                  defaultMessage="Introduction"
                  description="Label for a field where the user inputs text for an introduction to a tipline resource that has an RSS feed"
                  id="smoochBotResourceEditor.introduction"
                /> :
                <FormattedMessage
                  defaultMessage="Text"
                  description="Label for a field where the user inputs text for the contents of a static tipline resource"
                  id="smoochBotResourceEditor.text"
                />
            }
            maxChars={resource.content_type === 'rss' ? 180 : 720}
            maxHeight="200px"
            required={false}
            value={resource.content}
            onChange={e => updateResource({ content: e.target.value })}
            onErrorTooLong={(error) => {
              setDisableSaveTextTooLong(error);
            }}
          />
          <div className={cx(newsletterStyles['newsletter-body'], inputStyles['form-fieldset-field'])}>
            <div className={newsletterStyles.switcher}>
              <SwitchComponent
                checked={resource.content_type === 'rss'}
                helperContent={<FormattedMessage defaultMessage="Use an RSS feed to automatically load new content for your resource." description="Message on tipline resource settings page that explains how RSS feeds work there." id="smoochBotResourceEditor.rssFeed" />}
                key={`resource-rss-feed-enabled-${resource.id}`}
                label={<FormattedMessage
                  defaultMessage="RSS"
                  description="Label for a switch where the user turns on RSS (Really Simple Syndication) capability - should not be translated unless there is a local idiom for 'RSS'"
                  id="smoochBotResourceEditor.rss"
                />}
                onChange={(checked) => {
                  if (checked) {
                    updateResource({ content_type: 'rss', number_of_articles: 3 });
                  } else {
                    updateResource({ content_type: 'static' });
                  }
                }}
              />
            </div>
            { resource.content_type === 'rss' ?
              <NewsletterRssFeed
                helpContent={errors.rss_feed_url}
                numberOfArticles={resource.number_of_articles}
                parentErrors={errors}
                rssFeedUrl={resource.rss_feed_url}
                onUpdateNumberOfArticles={(value) => { updateResource({ number_of_articles: value }); }}
                onUpdateUrl={(value) => { updateResource({ rss_feed_url: value }); }}
              /> : null }
          </div>
        </div>
        <br />
        <div className={inputStyles['form-footer-actions']}>
          { resource.id ?
            <div className={inputStyles['form-footer-actions-secondary']}>
              <ButtonMain
                className="int-resource__delete-button"
                iconLeft={<DeleteIcon />}
                label={
                  <FormattedMessage
                    defaultMessage="Delete"
                    description="Label for action button to delete a tipline resource."
                    id="smoochBotResourceEditor.delete"
                  />
                }
                size="default"
                theme="lightError"
                variant="contained"
                onClick={handleConfirmDelete}
              />
            </div>
            : null }
          <ButtonMain
            disabled={disableSaveNoFile || disableSaveTextTooLong || saving}
            label={resource.id ? intl.formatMessage(messages.saveResource) : intl.formatMessage(messages.createResource)}
            size="default"
            theme="info"
            variant="contained"
            onClick={handleSave}
          />
        </div>
      </div>

      <ConfirmProceedDialog
        body={
          <FormattedMessage
            defaultMessage="This content won't be available for tipline users anymore. This action can't be undone."
            description="Confirmation dialog message when deleting a tipline resource."
            id="smoochBotResourceEditor.confirmationDialogBody"
          />
        }
        isSaving={saving}
        open={showConfirmationDialog}
        proceedLabel={<FormattedMessage defaultMessage="Delete" description="Button label to confirm tipline resource deletion." id="smoochBotResourceEditor.confirmationDialogButton" />}
        title={
          <FormattedMessage
            defaultMessage="Are you sure you want to delete this resource?"
            description="Confirmation dialog title when deleting a tipline resource."
            id="smoochBotResourceEditor.confirmationDialogTitle"
          />
        }
        onCancel={() => { setShowConfirmationDialog(false); }}
        onProceed={handleDelete}
      />
    </div>
  );
};

SmoochBotResourceEditorComponent.defaultProps = {
  resource: {}, // If it's a resource without an ID, then a new resource is being created
};

SmoochBotResourceEditorComponent.propTypes = {
  environment: PropTypes.object.isRequired, // Relay Modern environment to support file uploads
  language: PropTypes.string.isRequired,
  resource: PropTypes.shape({
    id: PropTypes.string,
    dbid: PropTypes.number,
    uuid: PropTypes.string,
    title: PropTypes.string,
    header_file_url: PropTypes.string,
    header_type: PropTypes.string,
  }),
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
  onCreate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

// eslint-disable-next-line import/no-unused-modules
export { SmoochBotResourceEditorComponent };

const SmoochBotResourceEditor = createFragmentContainer(withSetFlashMessage(SmoochBotResourceEditorComponent), graphql`
  fragment SmoochBotResourceEditor_tiplineResource on TiplineResource {
    id
    dbid
    uuid
    language
    title
    header_type
    header_file_url
    header_overlay_text
    content_type
    content
    number_of_articles
    rss_feed_url
  }
`);

export default injectIntl(SmoochBotResourceEditor);
