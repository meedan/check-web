import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import MdInsertPhoto from 'react-icons/lib/md/insert-photo';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import CreateCommentMutation from '../../relay/CreateCommentMutation';
import CreateTagMutation from '../../relay/CreateTagMutation';
import CreateStatusMutation from '../../relay/CreateStatusMutation';
import UpdateStatusMutation from '../../relay/UpdateStatusMutation';
import CreateFlagMutation from '../../relay/CreateFlagMutation';
import CreateDynamicMutation from '../../relay/CreateDynamicMutation';
import CheckContext from '../../CheckContext';
import UploadImage from '../UploadImage';
import { ContentColumn, Row, black38, black87, alertRed, units } from '../../styles/js/shared';
import HttpStatus from '../../HttpStatus';

const messages = defineMessages({
  invalidCommand: {
    id: 'addAnnotation.invalidCommand',
    defaultMessage: 'Invalid command',
  },
  annotationAdded: {
    id: 'addAnnotation.annotationAdded',
    defaultMessage: 'Your {type} was added!',
  },
  error: {
    id: 'addAnnotation.error',
    defaultMessage:
      'Something went wrong! The server returned an error code {code}. Please contact a system administrator.',
  },
  inputHint: {
    id: 'addAnnotation.inputHint',
    defaultMessage: 'Add a note about this',
  },
  submitButton: {
    id: 'addAnnotation.submitButton',
    defaultMessage: 'Submit',
  },
  typeComment: {
    id: 'addAnnotation.typeComment',
    defaultMessage: 'comment',
  },
  typeTag: {
    id: 'addAnnotation.typeTag',
    defaultMessage: 'tag',
  },
  typeStatus: {
    id: 'addAnnotation.typeStatus',
    defaultMessage: 'status',
  },
  typeFlag: {
    id: 'addAnnotation.typeFlag',
    defaultMessage: 'flag',
  },
  addImage: {
    id: 'addAnnotation.addImage',
    defaultMessage: 'Add an image',
  },
});

const styles = {
  errorStyle: {
    color: alertRed,
  },
  successStyle: {
    color: black87,
  },
};

class AddAnnotation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cmd: '',
      message: null,
      isSubmitting: false,
      fileMode: false,
    };
  }

  parseCommand(input) {
    const matches = input.match(/^\/([a-z_]+) (.*)/);
    let command = { type: 'unk', args: null };
    if (matches !== null) {
      command.type = matches[1];
      command.args = matches[2];
    } else if (/^[^/]/.test(input) || !input) {
      command = { type: 'comment', args: input };
    }
    return command;
  }

  failure() {
    this.setState({
      message: this.props.intl.formatMessage(messages.invalidCommand),
      isSubmitting: false,
    });
  }

  success(message) {
    document.forms.addannotation.image = null;

    this.setState({
      cmd: '',
      message,
      isSubmitting: false,
      fileMode: false,
      messageStyle: styles.successStyle,
    });
  }

  fail(transaction) {
    const transactionError = transaction.getError();
    let message = this.props.intl.formatMessage(messages.error, {
      code: `${transactionError.status} ${HttpStatus.getMessage(
        transactionError.status,
      )}`,
    });
    let json = null;
    try {
      json = JSON.parse(transactionError.source);
    } catch (e) {
      // do nothing
    }
    if (json && json.error) {
      message = json.error;
    }

    this.setState({
      message: message.replace(/<br\s*\/?>/gm, '; '),
      isSubmitting: false,
      messageStyle: styles.errorStyle,
    });
  }

  getContext() {
    const context = new CheckContext(this).getContextStore();
    return context;
  }

  addComment(
    annotated,
    annotated_id,
    annotated_type,
    comment,
  ) {
    const { formatMessage } = this.props.intl;

    const onFailure = (transaction) => {
      this.fail(transaction);
    };

    const onSuccess = () => {
      this.success(
        formatMessage(messages.annotationAdded, {
          type: formatMessage(messages.typeComment),
        }),
      );
    };

    const annotator = this.getContext().currentUser;

    let image = '';
    if (this.state.fileMode) {
      image = document.forms.addannotation.image;
    }

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
      { onSuccess, onFailure },
    );
  }

  addTag(annotated, annotated_id, annotated_type, tags) {
    const tagsList = [...new Set(tags.split(','))];

    const { formatMessage } = this.props.intl;

    const onFailure = (transaction) => {
      this.fail(transaction);
    };

    const onSuccess = () => {
      this.success(
        formatMessage(messages.annotationAdded, {
          type: formatMessage(messages.typeTag),
        }),
      );
    };

    const annotator = this.getContext().currentUser;

    const context = this.getContext();

    tagsList.map((tag) => {
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
        { onSuccess, onFailure },
      );
    });
  }

  addStatus(annotated, annotated_id, annotated_type, status) {
    const { formatMessage } = this.props.intl;

    const onFailure = (transaction) => {
      this.fail(transaction);
    };

    const onSuccess = () => {
      this.success(
        formatMessage(messages.annotationAdded, {
          type: formatMessage(messages.typeStatus),
        }),
      );
    };

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
        onSuccess,
        onFailure,
      });
    } else {
      Relay.Store.commitUpdate(new CreateStatusMutation(status_attr), {
        onSuccess,
        onFailure,
      });
    }
  }

  addFlag(annotated, annotated_id, annotated_type, flag) {
    const { formatMessage } = this.props.intl;

    const onFailure = (transaction) => {
      this.fail(transaction);
    };

    const onSuccess = () => {
      this.success(
        formatMessage(messages.annotationAdded, {
          type: formatMessage(messages.typeFlag),
        }),
      );
    };

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
      { onSuccess, onFailure },
    );
  }

  addDynamic(annotated, annotated_id, annotated_type, params, annotation_type) {
    const { formatMessage } = this.props.intl;

    const onFailure = (transaction) => {
      this.fail(transaction);
    };

    const onSuccess = () => {
      this.success(
        formatMessage(messages.annotationAdded, { type: annotation_type }),
      );
    };

    const annotator = this.getContext().currentUser;

    // /location location_name=Salvador&location_position=-12.9016241,-38.4198075
    const fields = {};
    if (params) {
      params.split('&').forEach((part) => {
        const pair = part.split('=');
        fields[pair[0]] = pair[1];
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
      { onSuccess, onFailure },
    );
  }

  handleChange(e) {
    this.setState({ cmd: e.target.value, message: null });
  }

  handleFocus() {
    this.setState({ message: null });
  }

  handleSubmit(e) {
    const command = this.parseCommand(this.state.cmd);
    if (this.state.isSubmitting) {
      return e.preventDefault();
    }

    this.setState({ isSubmitting: true });
    let action = null;

    if (this.props.types && this.props.types.indexOf(command.type) == -1) {
      this.failure();
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
        const annotated = this.props.annotated;
        const annotated_id = annotated.dbid;
        const annotated_type = this.props.annotatedType;
        action(
          annotated,
          annotated_id,
          annotated_type,
          command.args,
          command.type,
        );
      } else {
        this.failure();
      }
    }

    e.preventDefault();
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      this.handleSubmit(e);
    }
  }

  onImage(file) {
    document.forms.addannotation.image = file;
  }

  onImageError(file, message) {
    this.setState({ message });
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

    return (
      <form
        className="add-annotation"
        name="addannotation"
        onSubmit={this.handleSubmit.bind(this)}
        style={{ height: '100%', padding: units(2), position: 'relative', zIndex: 0 }}
      >
        <ContentColumn flex>
          <TextField
            hintText={this.props.intl.formatMessage(messages.inputHint)}
            fullWidth={false}
            style={{ width: '100%' }}
            errorStyle={this.state.messageStyle}
            onFocus={this.handleFocus.bind(this)}
            ref={ref => (this.cmd = ref)}
            errorText={this.state.message}
            name="cmd"
            id="cmd-input"
            multiLine
            onKeyPress={this.handleKeyPress.bind(this)}
            value={this.state.cmd}
            onChange={this.handleChange.bind(this)}
          />
          {(() => {
            if (this.state.fileMode) {
              return (
                <UploadImage
                  onImage={this.onImage.bind(this)}
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
            <FlatButton
              label={this.props.intl.formatMessage(messages.submitButton)}
              primary
              type="submit"
            />
          </AddAnnotationButtonGroup>
        </ContentColumn>
      </form>
    );
  }
}

AddAnnotation.propTypes = {
  intl: intlShape.isRequired,
};

AddAnnotation.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(AddAnnotation);
