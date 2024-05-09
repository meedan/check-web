import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import LinkifyIt from 'linkify-it';
import cx from 'classnames/bind';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextField from '../cds/inputs/TextField';
import AddIcon from '../../icons/add.svg';
import Alert from '../cds/alerts-and-prompts/Alert';
import CreateSourceMutation from '../../relay/mutations/CreateSourceMutation';
import SourcePicture from '../source/SourcePicture';
import SetSourceDialog from './SetSourceDialog';
import { getErrorObjects, getErrorMessage } from '../../helpers';
import CheckError from '../../CheckError';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import inputStyles from '../../styles/css/inputs.module.css';
import styles from '../media/media.module.css';

function CreateMediaSource({
  media,
  onCancel,
  relateToExistingSource,
  name,
}) {
  const [sourceName, setSourceName] = React.useState(name || '');
  const [primaryUrl, setPrimaryUrl] = React.useState({ url: '', error: '' });
  const [submitDisabled, setSubmitDisabled] = React.useState(!name);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [validatePrimaryLinkExist, setValidatePrimaryLinkExist] = React.useState(true);
  const [links, setLinks] = React.useState([]);
  const [message, setMessage] = React.useState(null);
  const [existingSource, setExistingSource] = React.useState({});

  const handleChangeLink = (e, index) => {
    const newLinks = links.slice();
    newLinks[index].url = e.target.value;
    newLinks[index].error = '';
    setLinks(newLinks);
  };

  const handleChangeName = (e) => {
    const submitDisabledValue = e.target.value.length === 0;
    setSourceName(e.target.value);
    setSubmitDisabled(submitDisabledValue);
  };

  const handleRemoveNewLink = (index) => {
    const newLinks = links.slice();
    newLinks.splice(index, 1);
    setLinks(newLinks);
  };

  const handleAddLink = () => {
    const newLinks = links.slice();
    newLinks.push({ url: '', error: '' });
    setLinks(newLinks);
  };

  const validatePrimaryLink = () => {
    const linkify = new LinkifyIt();
    if (primaryUrl.url.trim()) {
      if (!/^https?:\/\//.test(primaryUrl.url)) {
        primaryUrl.url = `http://${primaryUrl.url}`; // Pender will turn into HTTPS if available
      }
      const validateUrl = linkify.match(primaryUrl.url);
      if (Array.isArray(validateUrl) && validateUrl[0] && validateUrl[0].url) {
        return true;
      }
      const error = (
        <FormattedMessage
          id="sourceInfo.invalidLink"
          defaultMessage="Please enter a valid URL"
          description="Error message for invalid link"
        />
      );
      setPrimaryUrl({ url: primaryUrl.url, error });
      return false;
    }
    return true;
  };

  const validateLinks = () => {
    const linkify = new LinkifyIt();

    let success = true;

    const newLinks = links.slice().filter(link => !!link.url.trim()).map((link) => {
      let { url } = link;
      if (!/^https?:\/\//.test(link)) {
        url = `http://${url}`; // Pender will turn into HTTPS if available
      }
      return { ...link, url };
    });

    newLinks.forEach((item_) => {
      const item = item_;
      const url = linkify.match(item.url);
      if (Array.isArray(url) && url[0] && url[0].url) {
        item.url = url[0].url;
      } else {
        item.error = (
          <FormattedMessage
            id="sourceInfo.invalidLink"
            defaultMessage="Please enter a valid URL"
            description="Error message for invalid link"
          />
        );
        success = false;
      }
    });

    setLinks(newLinks);
    return success;
  };

  const handleCancelOrSave = () => {
    onCancel();
  };

  const handleCancelDialog = () => {
    setDialogOpen(false);
    setValidatePrimaryLinkExist(false);
  };

  const handleSubmitDialog = () => {
    relateToExistingSource({ dbid: existingSource.id });
  };

  const handleSave = () => {
    if (!submitDisabled && validateLinks() && validatePrimaryLink()) {
      setSubmitDisabled(true);
      const urls = [];
      let newLinks = [primaryUrl].concat(links);
      newLinks = newLinks.filter(link => !!link.url.trim());
      newLinks.forEach((link) => {
        urls.push(link.url);
      });

      const onFailure = (transaction) => {
        setSubmitDisabled(false);
        const error = getErrorObjects(transaction);
        if (Array.isArray(error) && error.length > 0) {
          if (error[0].code === CheckError.codes.DUPLICATED) {
            setDialogOpen(true);
            setExistingSource(error[0].data);
          } else {
            const messageError = getErrorMessage(transaction, <GenericUnknownErrorMessage />);
            setMessage(messageError);
          }
        }
      };

      const onSuccess = () => {
        handleCancelOrSave();
      };

      Relay.Store.commitUpdate(
        new CreateSourceMutation({
          name: sourceName,
          slogan: sourceName,
          urls,
          validate_primary_link_exist: validatePrimaryLinkExist,
          project_media: media,
        }),
        { onSuccess, onFailure },
      );
    }
    return true;
  };

  return (
    <React.Fragment>
      { message && <><Alert variant="error" contained title={message} /><br /></> }
      <div className={inputStyles['form-inner-wrapper']}>
        <div className={styles['media-sources-header']}>
          <div className={styles['media-sources-header-left']}>
            <SourcePicture
              type="user"
              className="source__avatar"
            />
            <div className={styles['media-sources-title']}>
              <h6 className="source__name">
                {sourceName.length !== 0 ?
                  sourceName :
                  <FormattedMessage
                    id="sourceInfo.createNew"
                    defaultMessage="Create new"
                    description="Create a new media source label"
                  />
                }
              </h6>
              <span className="typography-caption">
                <FormattedMessage
                  id="sourceInfo.mediasCount"
                  defaultMessage="{mediasCount, plural, one {1 item} other {# items}}"
                  description="show source media counts"
                  values={{
                    mediasCount: 0,
                  }}
                />
              </span>
            </div>
          </div>
        </div>
        <div className={inputStyles['form-inner-wrapper']}>
          <div className={inputStyles['form-fieldset']}>
            <FormattedMessage
              id="sourceInfo.sourceNamePlaceholder"
              defaultMessage="Add a name for this source"
              description="placeholder for create source name"
            >
              { placeholder => (
                <TextField
                  className={inputStyles['form-fieldset-field']}
                  componentProps={{
                    id: 'source__name-input',
                    name: 'source__name-input',
                  }}
                  defaultValue={sourceName}
                  placeholder={placeholder}
                  label={
                    <FormattedMessage
                      id="sourceInfo.sourceName"
                      defaultMessage="Main Source Name"
                      description="label for create source name"
                    />
                  }
                  onChange={e => handleChangeName(e)}
                  required
                />
              )}
            </FormattedMessage>
            <FormattedMessage
              id="sourceInfo.primaryLinkPlaceholder"
              defaultMessage="Add a main URL for this source"
              description="placeholder for create source main url"
            >
              { placeholder => (
                <TextField
                  className={inputStyles['form-fieldset-field']}
                  componentProps={{
                    id: 'source_primary__link-input',
                    name: 'source_primary__link-input',
                  }}
                  placeholder={placeholder}
                  label={
                    <FormattedMessage
                      id="sourceInfo.primaryLink"
                      defaultMessage="Main source URL"
                      description="Allow user to add a main source URL"
                    />
                  }
                  defaultValue={primaryUrl.url ? primaryUrl.url.replace(/^https?:\/\//, '') : ''}
                  error={Boolean(primaryUrl.error)}
                  helpContent={primaryUrl.error}
                  onChange={(e) => { setPrimaryUrl({ url: e.target.value, error: '' }); }}
                />
              )}
            </FormattedMessage>
            { links.length === 0 ?
              null :
              <div className={inputStyles['form-fieldset-title']}>
                <FormattedMessage
                  id="sourceInfo.secondaryAccounts"
                  defaultMessage="Secondary source URLs"
                  description="URLs for source accounts except first account"
                />
              </div>
            }
            { links.map((link, index) => (
              <div key={index.toString()} className={cx('source__url-input', inputStyles['form-fieldset-field'])}>
                <TextField
                  componentProps={{
                    id: `source__link-input${index.toString()}`,
                    name: `source__link-input${index.toString()}`,
                  }}
                  defaultValue={link.url ? link.url.replace(/^https?:\/\//, '') : ''}
                  error={Boolean(link.error)}
                  helpContent={link.error}
                  label={
                    <FormattedMessage
                      id="sourceInfo.addSecondaryLink"
                      defaultMessage="Add a secondary URL"
                      description="Label for add a new source secondary URL"
                    />
                  }
                  onChange={(e) => { handleChangeLink(e, index); }}
                  onRemove={() => handleRemoveNewLink(index)}
                  placeholder="http(s)://"
                />
              </div>
            ))}
            <div className={inputStyles['form-footer-actions']}>
              <ButtonMain
                variant="contained"
                theme="text"
                size="default"
                onClick={() => handleAddLink()}
                iconLeft={<AddIcon />}
                label={
                  <FormattedMessage
                    id="sourceInfo.addLink"
                    defaultMessage="Add a secondary URL"
                    description="allow user to relate a new link to media source"
                  />
                }
              />
            </div>
          </div>
        </div>
        <div className={inputStyles['form-footer-actions']}>
          <ButtonMain
            className="source__edit-cancel-button"
            size="default"
            variant="text"
            theme="lightText"
            onClick={handleCancelOrSave}
            label={
              <FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />
            }
          />
          <ButtonMain
            size="default"
            variant="contained"
            theme="brand"
            className="source__edit-save-button"
            onClick={handleSave}
            disabled={submitDisabled}
            label={
              <FormattedMessage
                id="createMediaSource.createSource"
                defaultMessage="Create source"
                description="Label for button to create a new source"
              />
            }
          />
        </div>
      </div>
      {dialogOpen ?
        <SetSourceDialog
          open={dialogOpen}
          sourceName={existingSource.name}
          primaryUrl={primaryUrl.url}
          onSubmit={handleSubmitDialog}
          onCancel={handleCancelDialog}
        /> : null
      }
    </React.Fragment>
  );
}

CreateMediaSource.defaultProps = {
  name: '',
};

CreateMediaSource.propTypes = {
  media: PropTypes.object.isRequired,
  onCancel: PropTypes.func.isRequired,
  relateToExistingSource: PropTypes.func.isRequired,
  name: PropTypes.string,
};

export default CreateMediaSource;
