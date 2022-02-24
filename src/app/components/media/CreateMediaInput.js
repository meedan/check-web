import React from 'react';
import { FormattedMessage } from 'react-intl';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import ClearIcon from '@material-ui/icons/Clear';
import urlRegex from 'url-regex';
import styled from 'styled-components';
import MediaStatusCommon from './MediaStatusCommon';
import Message from '../Message';
import UploadFile from '../UploadFile';
import {
  Row,
  units,
} from '../../styles/js/shared';

const StyledHeader = styled.span`
  & > h6 {
    font-size: 15px;
    margin-top: ${units(1)};
  }
`;

const StyledSubtitle = styled.span`
  & > h6 {
    font-size: 11px;
  }
`;

const StyledTextField = styled.span`
  & > div > div {
    font-size: 13px;
    padding: ${units(1)};
  }
`;

const StyledButton = styled.span`
  & > .MuiButtonBase-root {
    color: black;
    margin-top: ${units(-2)};
  }
  & > .MuiButtonBase-root > span > span {
    margin-top: -1px;
    margin-right: 3px;
  }
`;

class CreateMediaInput extends React.Component {
  state = {
    textValue: '',
    mediaFile: null,
    mediaMessage: null,
    status: this.props.team?.verification_statuses?.default,
    claimText: '',
  };

  getMediaInputValue = () => {
    const { mediaFile, textValue, claimText } = this.state;
    const inferMediaTypeFromMimeType = (mimeType) => {
      if (mimeType.match(/^audio/)) {
        return 'UploadedAudio';
      } else if (mimeType.match(/^image/)) {
        return 'UploadedImage';
      } else if (mimeType.match(/^video/)) {
        return 'UploadedVideo';
      }
      return null;
    };

    let mediaType = '';
    let file = '';
    let inputValue = '';
    let urls = '';
    let url = '';
    let quote = '';

    if (mediaFile) {
      file = mediaFile;
      if (!file) {
        return null;
      }
      mediaType = inferMediaTypeFromMimeType(file.type);
    } else {
      inputValue = textValue.trim();
      urls = inputValue.match(urlRegex());
      url = urls && urls[0] ? urls[0] : '';
      mediaType = 'Link';
      if (!inputValue || !inputValue.length) {
        return null;
      }
      if (!url.length || inputValue !== url) {
        // if anything other than a single url, save it as a quote
        quote = inputValue;
        mediaType = 'Claim';
      }
    }

    let title = 'Media';
    if (quote !== '') {
      title = quote;
    }
    if (url !== '') {
      title = url;
    }
    if (file !== '') {
      title = file.name;
    }

    if (url || quote || file) {
      return ({
        url,
        quote,
        file,
        title,
        mediaType,
        claimDescription: claimText,
      });
    }

    return null;
  };

  get currentErrorMessageOrNull() {
    return this.state.mediaMessage || null;
  }

  setStatus = (context, store, media, newStatus) => {
    this.setState({ status: newStatus });
  };

  handleKeyPress = (ev) => {
    if (ev.key === 'Enter' && ev.shiftKey) {
      ev.preventDefault();
      this.callOnSubmit();
    }
  };

  handleSubmit = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    this.callOnSubmit();
  }

  callOnSubmit() {
    const value = this.getMediaInputValue();
    if (!value) {
      return;
    }

    this.resetForm();

    if (this.props.onSubmit) {
      this.props.onSubmit(value, this.state.status);
    }
  }

  clearFile = () => {
    this.setState({
      mediaFile: null,
      mediaMessage: null,
    });
  }

  handleFileChange = (file) => {
    this.setState({ mediaFile: file, mediaMessage: null });
  };

  handleFileError = (file, message) => {
    this.setState({ mediaFile: null, mediaMessage: message });
  };

  handleChange = (ev) => {
    const textValue = ev.target.value;
    this.setState({ textValue });
  };

  handleClaimChange = (ev) => {
    const claimText = ev.target.value;
    this.setState({ claimText });
  };

  resetForm() {
    this.setState({
      textValue: '',
      mediaFile: null,
      mediaMessage: null,
    });
  }

  renderFormInput() {
    const defaultInputProps = {
      fullWidth: true,
      multiline: true,
      margin: 'normal',
      variant: 'outlined',
      rowsMax: 5,
    };

    return (
      <>
        <StyledHeader>
          <Typography variant="h6">
            <FormattedMessage id="createMedia.mediaClaimDescription" defaultMessage="Claim description" />
          </Typography>
        </StyledHeader>
        <StyledSubtitle>
          <Typography variant="subtitle1">
            <FormattedMessage id="createMedia.mediaClaimDescriptionSubtitle" defaultMessage="A description of the claim that needs to be reviewed." />
          </Typography>
        </StyledSubtitle>
        <FormattedMessage id="createMedia.mediaClaim" defaultMessage="Type something">
          {placeholder => (
            <StyledTextField>
              <TextField
                key="createMedia.media.claim"
                rows={3}
                placeholder={placeholder}
                name="claim"
                id="create-media-claim"
                value={this.state.claimText}
                onChange={this.handleClaimChange}
                autoFocus
                {...defaultInputProps}
              />
            </StyledTextField>
          )}
        </FormattedMessage>
        <StyledHeader>
          <Typography variant="h6">
            <FormattedMessage id="createMedia.media.media" defaultMessage="Media" />
          </Typography>
        </StyledHeader>
        <StyledSubtitle>
          <Typography variant="subtitle1">
            <FormattedMessage id="createMedia.mediaMediaSubtitle" defaultMessage="The media that contains the claim." />
          </Typography>
        </StyledSubtitle>
        {
          this.state.mediaFile === null ? (
            <FormattedMessage id="createMedia.mediaInput" defaultMessage="Add a URL to a social media post or webpage, or a block of text.">
              {placeholder => (
                <StyledTextField>
                  <TextField
                    key="createMedia.media.input"
                    placeholder={placeholder}
                    name="text"
                    id="create-media-input"
                    value={this.state.textValue}
                    onChange={this.handleChange}
                    onKeyPress={this.handleKeyPress}
                    disabled={this.state.mediaFile}
                    {...defaultInputProps}
                  />
                </StyledTextField>
              )}
            </FormattedMessage>
          ) : null
        }
        {
          (this.state.mediaFile === null && this.state.textValue.length === 0) ? (
            <FormattedMessage id="createMedia.or" defaultMessage="or" description="This will appear between two mutually exclusive inputs. If the user fills in one, then the other will be disabled." />
          ) : null
        }
        {
          this.state.textValue.length === 0 ? (
            <div>
              <UploadFile
                key="createMedia.image.upload"
                type="image+video+audio"
                onChange={this.handleFileChange}
                onError={this.handleFileError}
                value={this.state.mediaFile}
                disabled={this.state.textValue.length > 0}
                hidden={this.state.textValue.length > 0}
              />
              {
                this.state.mediaFile ? (
                  <StyledButton>
                    <Button
                      className="clear-button"
                      size="small"
                      color="secondary"
                      variant="text"
                      startIcon={<ClearIcon />}
                      onClick={this.clearFile}
                    >
                      <FormattedMessage id="createMedia.mediaRemoveFile" defaultMessage="Remove file" description="Label on a button that the user clicks in order to return a file upload box back to its 'empty' state." />
                    </Button>
                  </StyledButton>
                ) : null
              }
            </div>
          ) : null
        }
      </>
    );
  }

  render() {
    return (
      <div>
        <Message className="create-media__message" message={this.currentErrorMessageOrNull} />

        <form
          name="media"
          id={this.props.formId /* so outsiders can write <button type="submit" form="...id"> */}
          className="create-media__form"
          ref={this.props.formRef}
          onSubmit={this.handleSubmit}
        >
          <div id="create-media__field">
            {this.renderFormInput()}
          </div>

          <div style={{ marginTop: units(2) }}>
            <Row>
              <MediaStatusCommon
                media={{
                  team: this.props.team,
                }}
                setStatus={this.setStatus}
                quickAdd
                currentStatus={this.state.status}
              />
            </Row>
          </div>
        </form>
      </div>
    );
  }
}

export default CreateMediaInput;
