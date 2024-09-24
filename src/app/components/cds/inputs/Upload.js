// DESIGNS: https://www.figma.com/file/7ZlvdotCAzeIQcbIKxOB65/Components?type=design&node-id=531-31202&mode=design&t=G3fBIdgR6AWtOlNu-4
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import cx from 'classnames/bind';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import ErrorOutlineIcon from '../../../icons/error_outline.svg';
import CheckCircleIcon from '../../../icons/check_circle.svg';
import CancelIcon from '../../../icons/cancel.svg';
import styles from './Upload.module.css';

function Upload({
  className,
  error,
  fileName,
  handleFileChange,
  helpContent,
  setFile,
  setFileName,
}) {
  const [dropping, setDropping] = React.useState(false);
  // This is a state that keeps track of what element we are currently hovering the mouse over, which allows us to prevent weird render states around onDragLeave for elements that are contained within different elements
  const [enterTarget, setEnterTarget] = React.useState(null);
  // This state variable is for errors internal to the logic of this component, which will appear as a banner in the component itself.
  const [errorInternal, setErrorInternal] = React.useState(null);

  const errorTooManyFiles = (<FormattedMessage
    defaultMessage="You can only upload one file here. Please try uploading one file."
    description="This message appears when a user tries to add two or more files at once to the file upload widget."
    id="metadata.file.tooManyFiles"
  />);

  const errorInvalidFile = (<FormattedMessage
    defaultMessage="This is not a valid file. Please try again with a different file."
    description="This message appears when a user tries to add a file that the browser cannot read for some reason to the file upload widget."
    id="metadata.file.invalidFile"
  />);

  const handleClick = (e) => {
    e.preventDefault();
    // We use :scope to scope the query to just children of the parent element, in case there is more than one Upload component on the page
    const inputElement = e.target.parentElement.parentElement.querySelector(':scope .upload-input');
    if (inputElement) {
      inputElement.click();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.items[0]?.kind !== 'file') {
      setErrorInternal(errorInvalidFile);
    } else if (e.dataTransfer?.items?.length > 1) {
      setErrorInternal(errorTooManyFiles);
    } else {
      const fileData = e.dataTransfer?.items[0]?.getAsFile();
      setFile(fileData);
    }
    setDropping(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setEnterTarget(e.target);
    setDropping(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (e.target === enterTarget) {
      setDropping(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setFileName('');
  };

  const RenderDropZone = () => {
    if (dropping) {
      return (
        <div className={cx('typography-button', styles['drop-text'], styles.red)}>
          <FormattedMessage defaultMessage="Drop file here" description="A label that appears when a user drags a file over a valid file drop area" id="upload.dropFile" />
        </div>
      );
    }
    return (
      <div>
        <form>
          <input className={cx('upload-input', styles.input)} type="file" onChange={handleFileChange} />
        </form>
        <span className={`typography-button ${styles['drag-text']}`}>
          <FormattedMessage defaultMessage="Drag a file here or" description="A label that appears when a user drags a file over a valid file drop area. It ends with 'or' because it will be followed with a link that reads in English 'select a local file'." id="upload.dragMessage" />
        </span>
        &nbsp;
        <a className={cx('typography-button', styles['link-text'])} href="#!" onClick={handleClick}>
          <FormattedMessage defaultMessage="select a local file" description="Text for a link that when a user clicks it, it pulls up the file selector dialog for their local device operating system." id="upload.selectFile" />
        </a>.
      </div>
    );
  };

  const RenderFile = () => (
    <div
      className={cx(
        'typography-button',
        styles['file-name'],
        styles['file-name-grid'],
      )}
    >
      <div className={styles['file-name-added']}>
        <CheckCircleIcon className={styles['icon-label']} />
        <span className={styles['file-name-output']}>{fileName}</span>
      </div>
      <Tooltip
        arrow
        placement="right"
        title={
          <FormattedMessage
            defaultMessage="Remove file"
            description="Tooltip message displayed on upload component. Cancel file selected for upload"
            id="upload.removeUpload"
          />
        }
      >
        <span>
          <ButtonMain
            iconCenter={<CancelIcon />}
            size="large"
            theme="info"
            variant="text"
            onClick={handleRemove}
          />
        </span>
      </Tooltip>
    </div>
  );

  const RenderError = () => (
    <div className={styles.error}>
      <div><ErrorOutlineIcon className={styles['error-icon']} />&nbsp;<span>{fileName}</span></div>
      <div className="typography-caption">{ errorInternal || helpContent }</div>
    </div>
  );

  return (
    <div
      className={cx(
        [styles.container],
        {
          [className]: true,
          [styles.dropping]: dropping && !fileName,
          [styles['file-name-container']]: fileName,
          [styles['container-error']]: errorInternal,
        })
      }
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      { (errorInternal || error) && <RenderError /> }
      { fileName ? <RenderFile /> : <RenderDropZone /> }
    </div>
  );
}

Upload.defaultProps = {
  className: null,
  fileName: '',
};

Upload.propTypes = {
  className: PropTypes.string,
  fileName: PropTypes.string,
  handleFileChange: PropTypes.func.isRequired,
};

export default Upload;
