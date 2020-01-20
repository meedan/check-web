import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay/classic';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import MdInsertPhoto from 'react-icons/lib/md/insert-photo';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import CreateCommentMutation from '../../relay/mutations/CreateCommentMutation';
import CreateTagMutation from '../../relay/mutations/CreateTagMutation';
import CreateStatusMutation from '../../relay/mutations/CreateStatusMutation';
import UpdateStatusMutation from '../../relay/mutations/UpdateStatusMutation';
import CreateFlagMutation from '../../relay/mutations/CreateFlagMutation';
import CreateDynamicMutation from '../../relay/mutations/CreateDynamicMutation';
import { can } from '../Can';
import CheckContext from '../../CheckContext';
import UploadImage from '../UploadImage';
import { ContentColumn, Row, black38, black87, units } from '../../styles/js/shared';
import { getErrorMessage } from '../../helpers';
import { stringHelper } from '../../customHelpers';

const messages = defineMessages({
  invalidCommand: {
    id: 'addAnnotation.invalidCommand',
    defaultMessage: 'Invalid command',
  },
  error: {
    id: 'addAnnotation.error',
    defaultMessage: 'Sorry, an error occurred while updating the item. Please try again and contact {supportEmail} if the condition persists.',
  },
  inputHint: {
    id: 'addAnnotation.inputHint',
    defaultMessage: 'Add a comment',
  },
  submitButton: {
    id: 'addAnnotation.submitButton',
    defaultMessage: 'Submit',
  },
  addImage: {
    id: 'addAnnotation.addImage',
    defaultMessage: 'Add an image',
  },
});

class AddAnnotation extends Component {
  static parseCommand(input) {
    const matches = input.match(/^\/([a-z_]+) (.*)/);
    let command = { type: 'unk', args: null };
    if (matches !== null) {
      ([, command.type, command.args] = matches);
    } else if (/^[^/]/.test(input) || !input) {
      command = { type: 'comment', args: input };
    }
    return command;
  }

  constructor(props) {
    super(props);

    this.state = {
      cmd: '',
      message: null,
      isSubmitting: false,
      fileMode: false,
      canBeAutoChanged: true,
    };
  }

  componentDidMount() {
    // This code only applies if this page is embedded in the browser extension
    if (window.parent !== window && this.props.annotatedType === 'Task') {
      // Receive the selected text from the page and use it to fill a task note
      const task = this.props.annotated;
      const receiveMessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.selectedText &&
          this.state.canBeAutoChanged &&
          (this.props.taskResponse || task.type !== 'free_text') &&
          parseInt(data.task, 10) === parseInt(this.props.annotated.dbid, 10)) {
          this.setState({ cmd: data.selectedText });
        }
      };
      window.addEventListener('message', receiveMessage, false);
    }
  }

  static onImage(file) {
    document.forms.addannotation.image = file;
  }

  onImageError(file, message) {
    this.setState({ message });
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  invalidCommand() {
    this.setState({
      message: this.props.intl.formatMessage(messages.invalidCommand),
      isSubmitting: false,
    });
  }

  success = () => {
    document.forms.addannotation.image = null;

    this.setState({
      cmd: '',
      message: null,
      isSubmitting: false,
      fileMode: false,
    });
  };

  fail = (transaction) => {
    const fallbackMessage = this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') });
    const message = getErrorMessage(transaction, fallbackMessage);
    this.setState({
      message: message.replace(/<br\s*\/?>/gm, '; '),
      isSubmitting: false,
    });
  };

  addComment(
    annotated,
    annotated_id,
    annotated_type,
    comment,
  ) {
    const { currentUser: annotator } = this.getContext();

    const image = this.state.fileMode ? document.forms.addannotation.image : '';

    Relay.Store.commitUpdate(
      new CreateCommentMutation({
        parent_type: annotated_type
          .replace(/([a-z])([A-Z])/, '$1_$2')
          .toLowerCase(),
        annotator,
        annotated,
        image,
        context: this.getContext(),
        annotation: {
          text: comment,
          annotated_type,
          annotated_id,
        },
      }),
      { onFailure: this.fail, onSuccess: this.success },
    );
  }

  addTag(annotated, annotated_id, annotated_type, tags) {
    const tagsList = [...new Set(tags.split(','))];

    const annotator = this.getContext().currentUser;

    const context = this.getContext();

    tagsList.forEach((tag) => {
      Relay.Store.commitUpdate(
        new CreateTagMutation({
          annotated,
          annotator,
          parent_type: annotated_type
            .replace(/([a-z])([A-Z])/, '$1_$2')
            .toLowerCase(),
          context,
          annotation: {
            tag: tag.trim(),
            annotated_type,
            annotated_id,
          },
        }),
        { onFailure: this.fail, onSuccess: this.success },
      );
    });
  }

  addStatus(annotated, annotated_id, annotated_type, status) {
    const annotator = this.getContext().currentUser;

    let status_id = '';
    if (annotated.last_status_obj !== null) {
      status_id = annotated.last_status_obj.id;
    }
    const status_attr = {
      parent_type: annotated_type
        .replace(/([a-z])([A-Z])/, '$1_$2')
        .toLowerCase(),
      annotated,
      annotator,
      context: this.getContext(),
      annotation: {
        status,
        annotated_type,
        annotated_id,
        status_id,
      },
    };
    // Add or Update status
    if (status_id && status_id.length) {
      Relay.Store.commitUpdate(new UpdateStatusMutation(status_attr), {
        onFailure: this.fail, onSuccess: this.success,
      });
    } else {
      Relay.Store.commitUpdate(new CreateStatusMutation(status_attr), {
        onFailure: this.fail, onSuccess: this.success,
      });
    }
  }

  addFlag(annotated, annotated_id, annotated_type, flag) {
    const annotator = this.getContext().currentUser;

    Relay.Store.commitUpdate(
      new CreateFlagMutation({
        parent_type: annotated_type
          .replace(/([a-z])([A-Z])/, '$1_$2')
          .toLowerCase(),
        annotated,
        annotator,
        context: this.getContext(),
        annotation: {
          flag,
          annotated_type,
          annotated_id,
        },
      }),
      { onFailure: this.fail, onSuccess: this.success },
    );
  }

  addDynamic(annotated, annotated_id, annotated_type, params, annotation_type) {
    const annotator = this.getContext().currentUser;

    // /location location_name=Salvador&location_position=-12.9016241,-38.4198075
    const fields = {};
    if (params) {
      params.split('&').forEach((part) => {
        const [pair0, pair1] = part.split('=');
        fields[pair0] = pair1;
      });
    }

    Relay.Store.commitUpdate(
      new CreateDynamicMutation({
        parent_type: annotated_type
          .replace(/([a-z])([A-Z])/, '$1_$2')
          .toLowerCase(),
        annotator,
        annotated,
        context: this.getContext(),
        annotation: {
          fields,
          annotation_type,
          annotated_type,
          annotated_id,
        },
      }),
      { onFailure: this.fail, onSuccess: this.success },
    );
  }

  handleChange(e) {
    this.setState({ cmd: e.target.value, message: null });
  }

  handleFocus() {
    this.setState({ message: null });
  }

  handleSubmit(e) {
    const command = AddAnnotation.parseCommand(this.state.cmd);
    if (this.state.isSubmitting) {
      e.preventDefault();
      return;
    }

    this.setState({ isSubmitting: true });
    let action = null;

    if (this.props.types && this.props.types.indexOf(command.type) === -1) {
      this.invalidCommand();
    } else {
      switch (command.type) {
      case 'comment':
        action = this.addComment.bind(this);
        break;
      case 'tag':
        action = this.addTag.bind(this);
        break;
      case 'status':
        action = this.addStatus.bind(this);
        break;
      case 'flag':
        action = this.addFlag.bind(this);
        break;
      default:
        action = this.addDynamic.bind(this);
        break;
      }

      if (action) {
        const { annotated, annotatedType: annotated_type } = this.props;
        action(
          annotated,
          annotated.dbid,
          annotated_type,
          command.args,
          command.type,
        );
      } else {
        this.invalidCommand();
      }
    }

    e.preventDefault();
  }

  handleKeyUp(e) {
    if (e.target.value !== '' && this.state.canBeAutoChanged) {
      this.setState({ canBeAutoChanged: false });
    }
    if (e.target.value === '' && !this.state.canBeAutoChanged) {
      this.setState({ canBeAutoChanged: true });
    }
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit(e);
    }
  }

  switchMode() {
    this.setState({ fileMode: !this.state.fileMode });
  }

  render() {
    const AddAnnotationButtonGroup = styled(Row)`
      align-items: center;
      display: flex;
      justify-content: flex-end;
      margin-${props => props.isRtl ? 'right' : 'left'}: auto;
      .add-annotation__insert-photo {
        svg {
          path { color: ${black38}; }
          &:hover path {
            color: ${black87};
            cusor: pointer;
          }
          margin-${props => props.isRtl ? 'left' : 'right'}: 0;
        }
      }
    `;

    if (this.props.annotated.archived ||
      ((this.props.annotatedType === 'ProjectMedia' &&
      !can(this.props.annotated.permissions, 'create Comment')) ||
      (this.props.annotatedType === 'Task' &&
      !can(this.props.annotated.permissions, 'update Task'))
      )) {
      return null;
    }

    return (
      <form
        className="add-annotation"
        name="addannotation"
        onSubmit={this.handleSubmit.bind(this)}
        style={{
          height: '100%', paddingTop: units(2), position: 'relative', zIndex: 0,
        }}
      >
        <ContentColumn flex style={{ maxWidth: '100%' }}>
          <TextField
            placeholder={this.props.intl.formatMessage(messages.inputHint)}
            onFocus={this.handleFocus.bind(this)}
            ref={(i) => { this.cmd = i; }}
            error={Boolean(this.state.message)}
            helperText={this.state.message}
            name="cmd"
            id="cmd-input"
            multiline
            fullWidth
            onKeyPress={this.handleKeyPress.bind(this)}
            onKeyUp={this.handleKeyUp.bind(this)}
            value={this.state.cmd}
            onChange={this.handleChange.bind(this)}
          />
          {(() => {
            if (this.state.fileMode) {
              return (
                <UploadImage
                  type="image"
                  onImage={AddAnnotation.onImage}
                  onError={this.onImageError.bind(this)}
                />
              );
            }
            return null;
          })()}
          <AddAnnotationButtonGroup
            className="add-annotation__buttons"
            isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}
          >
            <div className="add-annotation__insert-photo">
              <MdInsertPhoto
                id="add-annotation__switcher"
                title={this.props.intl.formatMessage(messages.addImage)}
                className={this.state.fileMode ? 'add-annotation__file' : ''}
                onClick={this.switchMode.bind(this)}
              />
            </div>
            <Button color="primary" type="submit">
              {this.props.intl.formatMessage(messages.submitButton)}
            </Button>
          </AddAnnotationButtonGroup>
        </ContentColumn>
      </form>
    );
  }
}

AddAnnotation.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

AddAnnotation.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(AddAnnotation);
