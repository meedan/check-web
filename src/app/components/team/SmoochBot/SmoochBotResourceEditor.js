import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { graphql, commitMutation as commitMutationCompat } from 'react-relay/compat';
import { commitMutation } from 'react-relay';
import { Store } from 'react-relay/classic';
import cx from 'classnames/bind';
import TextField from '../../cds/inputs/TextField';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import SwitchComponent from '../../cds/inputs/SwitchComponent';
import LimitedTextArea from '../../layout/inputs/LimitedTextArea';
import NewsletterHeader from '../Newsletter/NewsletterHeader';
import NewsletterRssFeed from '../Newsletter/NewsletterRssFeed';
import newsletterStyles from '../Newsletter/NewsletterComponent.module.css';
import styles from './SmoochBotResourceEditor.module.css';
import { withSetFlashMessage } from '../../FlashMessage';

const SmoochBotResourceEditor = (props) => {
  const {
    language,
    environment,
    setFlashMessage,
  } = props;
  // Existing resource or new resource
  const [resource, setResource] = React.useState({ ...props.resource });

  // States: File upload
  const [file, setFile] = React.useState(null);
  const fileNameFromUrl = new RegExp(/[^/\\&?]+\.\w{3,4}(?=([?&].*$|$))/);
  const [fileName, setFileName] = React.useState((resource.header_file_url && resource.header_file_url.match(fileNameFromUrl) && resource.header_file_url.match(fileNameFromUrl)[0]) || '');

  // States: Form validation
  const [errors, setErrors] = React.useState({});
  const [saving, setSaving] = React.useState(false);
  const [disableSaveNoFile, setDisableSaveNoFile] = React.useState(false);
  const [disableSaveTextTooLong, setDisableSaveTextTooLong] = React.useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const updateMutation = graphql`
    mutation SmoochBotResourceEditorUpdateMutation($input: UpdateTiplineResourceInput!) {
      updateTiplineResource(input: $input) {
        tipline_resource {
          id
          dbid
          uuid
          title
          language
          header_type
          header_overlay_text
          content_type
          content
          rss_feed_url
          number_of_articles
          team {
            tipline_resources(first: 10000) {
              edges {
                node {
                  id
                  dbid
                  uuid
                  title
                  language
                  header_type
                  header_overlay_text
                  content_type
                  content
                  rss_feed_url
                  number_of_articles
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
        }
      }
    }
  `;

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
            id="smoochBotResourceEditor.errorRssFeedUrl"
            defaultMessage="RSS feed URL is invalid."
            description="Error message displayed when a user submits a form with a URL that the server does not recognize."
          />
        );
      }
      if (data.title && data.title[0] === "can't be blank") {
        data.title = (
          <FormattedMessage
            id="smoochBotResourceEditor.errorTitle"
            defaultMessage="Title can't be blank"
            description="Error message displayed when a user submits a form with a blank title."
          />
        );
      }
      if (data.header_file && data.header_file[0].includes('cannot be of type')) {
        data.header_file = (
          <FormattedMessage
            id="smoochBotResourceEditor.errorHeaderFile"
            defaultMessage="File must be of the following allowed types: {fileTypes}"
            description="Error message displayed when a user uploads a file of the wrong type. This is followed with a list of file types like 'png, jpg, jpeg, pdf'."
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
          id="smoochBotResourceEditor.error"
          defaultMessage="Could not save resource, please try again."
          description="Error message displayed when it's not possible to save a resource."
        />
      ), 'error');
    }
  };

  const refreshStore = (response) => {
    // FIXME: This is a hack... send another dummy mutation in order to force an update of the Relay store
    // We can delete this once the Relay Modern network is capable of refreshing the Relay store
    // eslint-disable-next-line no-console
    commitMutationCompat(
      Store,
      {
        mutation: updateMutation,
        variables: {
          input: {
            id: resource.id || response.createTiplineResource.tipline_resource.id,
          },
        },
      },
    );
  };

  const handleSuccess = (response) => {
    setSaving(false);
    setErrors({});
    setFlashMessage((
      <FormattedMessage
        id="smoochBotResourceEditor.success"
        defaultMessage="Resource saved successfully."
        description="Success message displayed when a resource is saved."
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

  const updateResource = (changes) => { // "changes" is a hash { field => value }
    setResource({ ...resource, ...changes });
  };

  return (
    <div className={styles.resourceEditor}>
      <TextField
        required
        id="resource__title"
        defaultValue={resource.title}
        fullWidth
        label={
          <FormattedMessage
            id="smoochBotResourceEditor.title"
            defaultMessage="Title"
            description="Label for tipline resource title field"
          />
        }
        error={Boolean(errors.title)}
        helpContent={errors.title}
        margin="normal"
        onChange={e => updateResource({ title: e.target.value })}
        variant="outlined"
      />

      <div className={cx(newsletterStyles.settings, styles.settings)}>
        <div className="typography-subtitle2">
          <FormattedMessage id="smoochBotResourceEditor.content" defaultMessage="Content" description="Title for the resource content section on a tipline resource settings page" />
        </div>
        <NewsletterHeader
          className="resource-component-header"
          key={`resource-header-${resource.id}`}
          parentErrors={errors}
          file={file}
          handleFileChange={handleFileChange}
          setFile={setFile}
          setFileName={setFileName}
          availableHeaderTypes={['audio', 'video', 'image', 'none', 'link_preview']}
          headerType={resource.header_type || 'link_preview'}
          fileName={fileName}
          overlayText={resource.header_overlay_text || ''}
          onUpdateField={(fieldName, value) => {
            if (fieldName === 'headerType') {
              updateResource({ header_type: value });
            } else if (fieldName === 'overlayText') {
              updateResource({ header_overlay_text: value });
            }
          }}
        />
        <LimitedTextArea
          key={resource.content_type}
          required={false}
          maxChars={resource.content_type === 'rss' ? 180 : 720}
          onErrorTooLong={(error) => {
            setDisableSaveTextTooLong(error);
          }}
          value={resource.content}
          onChange={e => updateResource({ content: e.target.value })}
          error={errors.content}
          helpContent={errors.content}
          label={
            resource.content_type === 'rss' ?
              <FormattedMessage
                id="smoochBotResourceEditor.introduction"
                defaultMessage="Introduction"
                description="Label for a field where the user inputs text for an introduction to a tipline resource that has an RSS feed"
              /> :
              <FormattedMessage
                id="smoochBotResourceEditor.text"
                defaultMessage="Text"
                description="Label for a field where the user inputs text for the contents of a static tipline resource"
              />
          }
        />

        <div className={newsletterStyles['newsletter-body']}>
          <div className={newsletterStyles.switcher}>
            <SwitchComponent
              key={`resource-rss-feed-enabled-${resource.id}`}
              label={<FormattedMessage
                id="smoochBotResourceEditor.rss"
                defaultMessage="RSS"
                description="Label for a switch where the user turns on RSS (Really Simple Syndication) capability - should not be translated unless there is a local idiom for 'RSS'"
              />}
              helperContent={<FormattedMessage id="smoochBotResourceEditor.rssFeed" defaultMessage="Use an RSS feed to automatically load new content for your resource." description="Message on tipline resource settings page that explains how RSS feeds work there." />}
              checked={resource.content_type === 'rss'}
              onChange={(checked) => {
                if (checked) {
                  updateResource({ content_type: 'rss', number_of_articles: 3, content: '' });
                } else {
                  updateResource({ content_type: 'static', content: '' });
                }
              }}
            />
          </div>
          { resource.content_type === 'rss' ?
            <NewsletterRssFeed
              parentErrors={errors}
              helpContent={errors.rss_feed_url}
              numberOfArticles={resource.number_of_articles}
              onUpdateNumberOfArticles={(value) => { updateResource({ number_of_articles: value }); }}
              rssFeedUrl={resource.rss_feed_url}
              onUpdateUrl={(value) => { updateResource({ rss_feed_url: value }); }}
            /> : null }
        </div>
      </div>

      <div>
        <ButtonMain
          variant="contained"
          theme="brand"
          size="default"
          onClick={handleSave}
          disabled={disableSaveNoFile || disableSaveTextTooLong || saving}
          label={
            <FormattedMessage
              id="smoochBotResourceEditor.save"
              defaultMessage="Save"
              description="Label for action button to save a tipline resource."
            />
          }
        />
      </div>
    </div>
  );
};

SmoochBotResourceEditor.defaultProps = {
  resource: {}, // If it's a resource without an ID, then a new resource is being created
};

SmoochBotResourceEditor.propTypes = {
  environment: PropTypes.object.isRequired, // Relay Modern environment to support file uploads
  team: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
  language: PropTypes.string.isRequired,
  resource: PropTypes.shape({
    id: PropTypes.string,
    dbid: PropTypes.number,
    uuid: PropTypes.string,
    title: PropTypes.string,
    header_file_url: PropTypes.string,
    header_type: PropTypes.string,
  }),
};

export default withSetFlashMessage(SmoochBotResourceEditor);
