import React, { Component } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Popover from 'material-ui/Popover';
import Checkbox from 'material-ui/Checkbox';
import FlatButton from 'material-ui/FlatButton';
import CopyToClipboard from 'react-copy-to-clipboard';
import config from 'config';
import styled from 'styled-components';
import PageTitle from '../PageTitle';
import PenderCard from '../PenderCard';
import { FlexRow, ContentColumn, units, black87, black54, alertRed } from '../../styles/js/shared';

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

  #media-embed__copy-code {
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

    #media-embed__code-field {
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

const messages = defineMessages({
  preview: {
    id: 'mediaEmbed.embedPreview',
    defaultMessage: 'Embed preview',
  },
});

class MediaEmbed extends Component {
  constructor(props) {
    super(props);

    this.state = {
      customizationMenuOpened: false,
      codeMenuOpened: false,
      customizationMenuAnchor: null,
      codeMenuAnchor: null,
      version: new Date().getTime(),
      codeCopied: false,
      customizationOptions: {
        showTasks: true,
        showNotes: true,
      },
    };
  }

  handleCustomizationMenuOpen(e) {
    e.preventDefault();

    this.setState({
      customizationMenuOpened: true,
      customizationMenuAnchor: e.currentTarget,
    });
  }

  handleCustomizationMenuClose() {
    this.setState({
      customizationMenuOpened: false,
    });
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

  handleSelectCheckbox(option) {
    const options = Object.assign({}, this.state.customizationOptions);
    options[option] = !options[option];

    this.setState({
      customizationOptions: options,
      version: this.state.version + 1,
    });
  }

  render() {
    let url = window.location.href.replace(/\/embed$/, '');
    const parts = [];
    if (!this.state.customizationOptions.showTasks) {
      parts.push('hide_tasks=1');
    }
    if (!this.state.customizationOptions.showNotes) {
      parts.push('hide_notes=1');
    }
    if (parts.length > 0) {
      url = `${url}?${parts.join('&')}`;
    }

    const embedTag = `<script src="${config.penderUrl}/api/medias.js?url=${encodeURIComponent(
      url,
    )}"></script>`;

    return (
      <PageTitle title={this.props.intl.formatMessage(messages.preview)}>
        {config.appName !== 'check'
          ? <ContentColumn className="card">
            <h2 className="main-title">
              <FormattedMessage id="mediaEmbed.notAvailable" defaultMessage="Not available" />
            </h2>
          </ContentColumn>
          : <div id="media-embed">
            <StyledPopover
              open={this.state.customizationMenuOpened}
              anchorEl={this.state.customizationMenuAnchor}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              targetOrigin={{ horizontal: 'left', vertical: 'top' }}
              onRequestClose={this.handleCustomizationMenuClose.bind(this)}
              style={{ padding: units(2) }}
            >
              <div id="media-embed__customization-menu">
                <FlexRow>
                  <span className="media-embed__customization-label">
                    <FormattedMessage
                      id="mediaEmbed.customizationOptionShowTasks"
                      defaultMessage="Show tasks"
                    />{' '}
                    <br />
                    <span className="media-embed__customization-slogan">
                      <FormattedMessage
                        id="mediaEmbed.customizationOptionShowTasksSlogan"
                        defaultMessage="Add completed tasks to the embed"
                      />
                    </span>
                  </span>
                  <span>
                    <Checkbox
                      className="media-embed__customization-option"
                      checked={this.state.customizationOptions.showTasks}
                      onCheck={this.handleSelectCheckbox.bind(this, 'showTasks')}
                    />
                  </span>
                </FlexRow>

                <FlexRow>
                  <span className="media-embed__customization-label">
                    <FormattedMessage
                      id="mediaEmbed.customizationOptionShowNotes"
                      defaultMessage="Show notes"
                    />{' '}
                    <br />
                    <span className="media-embed__customization-slogan">
                      <FormattedMessage
                        id="mediaEmbed.customizationOptionShowNotesSlogan"
                        defaultMessage="Add notes to the embed"
                      />
                    </span>
                  </span>
                  <span>
                    <Checkbox
                      className="media-embed__customization-option"
                      checked={this.state.customizationOptions.showNotes}
                      onCheck={this.handleSelectCheckbox.bind(this, 'showNotes')}
                    />
                  </span>
                </FlexRow>
              </div>
            </StyledPopover>

            <StyledPopover
              open={this.state.codeMenuOpened}
              anchorEl={this.state.codeMenuAnchor}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              targetOrigin={{ horizontal: 'left', vertical: 'top' }}
              onRequestClose={this.handleCodeMenuClose.bind(this)}
            >
              <div id="media-embed__copy-code">
                <p className="media-embed__warning">
                  <FormattedMessage
                    id="mediaEmbed.warning"
                    defaultMessage="Warning — sharing this will expose information to people outside your private team. Proceed with caution."
                  />
                </p>
                <p className="media-embed__copy-footer">
                  <input disabled readOnly value={embedTag} id="media-embed__code-field" />
                  {this.state.codeCopied
                      ? <span className="media-embed__copy-button-inactive">
                        <FormattedMessage
                          id="mediaEmbed.copyButtonInactive"
                          defaultMessage="Copied"
                        />
                      </span>
                      : <span className="media-embed__copy-button">
                        <FormattedMessage id="mediaEmbed.copyButton" defaultMessage="Copy" />
                      </span>}
                </p>
              </div>
            </StyledPopover>

            <p id="media-embed__actions">
              <FlatButton
                id="media-embed__actions-customize"
                onClick={this.handleCustomizationMenuOpen.bind(this)}
                label={<FormattedMessage id="mediaEmbed.customize" defaultMessage="Customize" />}
              />
              <CopyToClipboard text={embedTag} onCopy={this.handleCopyEmbedCode.bind(this)}>
                <FlatButton
                  id="media-embed__actions-copy"
                  onClick={this.handleCodeMenuOpen.bind(this)}
                  label={
                    <FormattedMessage
                      id="mediaEmbed.copyEmbedCode"
                      defaultMessage="Copy embed code"
                    />
                    }
                />
              </CopyToClipboard>
            </p>

            <PenderCard
              url={url}
              domId={'embed-id'}
              penderUrl={config.penderUrl}
              fallback={null}
              mediaVersion={this.state.version}
            />
          </div>}
      </PageTitle>
    );
  }
}

MediaEmbed.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(MediaEmbed);
