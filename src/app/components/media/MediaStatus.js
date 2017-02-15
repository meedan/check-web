import React, { Component, PropTypes } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import CreateStatusMutation from '../../relay/CreateStatusMutation';
import UpdateStatusMutation from '../../relay/UpdateStatusMutation';
import Can, { can } from '../Can';
import CheckContext from '../../CheckContext';

const messages = defineMessages({
  error: {
    id: 'mediaStatus.error',
    defaultMessage: "We're sorry, but we encountered an error trying to update the status."
  }
});

class MediaStatus extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMediaStatusMenuOpen: false,
      message: null,
    };
  }

  canUpdate() {
    return !this.props.readonly && can(this.props.media.permissions, 'create Status');
  }

  toggleMediaStatusMenu() {
    const newState = this.canUpdate() ? !this.state.isMediaStatusMenuOpen : false;
    this.setState({ isMediaStatusMenuOpen: newState });
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
  }

  currentStatusToClass(status) {
    if (status === '') {
      return '';
    }
    return ` media-status__current--${status.toLowerCase().replace(/[ _]/g, '-')}`;
  }

  handleStatusClick(clickedStatus, r) {
    const { media } = this.props;

    if (clickedStatus !== media.last_status) {
      this.setStatus(this, media, clickedStatus);
    }
  }

  setStatus(context, media, status) {

    const onFailure = (transaction) => { context.fail(transaction); };
    const onSuccess = (response) => { context.success('status'); };

    const store = new CheckContext(this).getContextStore();

    let status_id = '';
    if (media.last_status_obj !== null) {
      status_id = media.last_status_obj.id;
    }
    let status_attr = {
        parent_type: 'project_media',
        annotated: media,
        annotator: store.currentUser,
        context: store,
        annotation: {
          status,
          annotated_type: 'ProjectMedia',
          annotated_id: media.dbid,
          status_id: status_id,
        },
      };

    // Add or Update status
    if (status_id && status_id.length) {
      Relay.Store.commitUpdate(
        new UpdateStatusMutation(status_attr),
        { onSuccess, onFailure },
      );
    } else {
      Relay.Store.commitUpdate(
        new CreateStatusMutation(status_attr),
        { onSuccess, onFailure },
      );
    }
  }

  fail(transaction) {
    const that = this;
    const error = transaction.getError();
    let message = this.props.intl.formatMessage(messages.error);
    try {
      const json = JSON.parse(error.source);
      if (json.error) {
        message = json.error;
      }
    } catch (e) { }
    that.setState({ message });
  }

  success(response) {
    // this.setState({ message: 'Status updated.' });
  }

  statusIdToLabel(id) {
    const statuses = JSON.parse(this.props.media.verification_statuses).statuses;
    let label = '';
    statuses.forEach((status) => {
      if (status.id === id) {
        label = status.label;
      }
    });
    return label;
  }

  render() {
    const that = this;
    const { media } = this.props;
    const statuses = JSON.parse(media.verification_statuses).statuses;
    const currentStatus = this.statusIdToLabel(media.last_status);

    return (
      <div className={this.bemClass('media-status', this.canUpdate(), '--editable')} onClick={this.toggleMediaStatusMenu.bind(this)}>
        <div className={this.bemClass('media-status__overlay', this.state.isMediaStatusMenuOpen, '--active')} onClick={this.toggleMediaStatusMenu.bind(this)} />

        <div className={`media-status__current${this.currentStatusToClass(media.last_status)}`}>
          <i className="media-status__icon media-status__icon--circle / fa fa-circle" />
          <span className="media-status__label">{currentStatus}</span>
          {this.canUpdate() ?
            <i className="media-status__icon media-status__icon--caret / fa fa-caret-down" />
            : null
          }
          <span className="media-status__message">{this.state.message}</span>
        </div>

        {this.canUpdate() ?
          <ul className={this.bemClass('media-status__menu', this.state.isMediaStatusMenuOpen, '--active')}>
            {statuses.map(status => (
              <li className={`${that.bemClass('media-status__menu-item', (media.last_status === status.id), '--current')} media-status__menu-item--${status.id.replace('_', '-')}`} onClick={that.handleStatusClick.bind(that, status.id)}>
                <i className="media-status__icon media-status__icon--radio-button-selected / fa fa-circle" />
                <i className="media-status__icon media-status__icon--radio-button / fa fa-circle-o" />
                <span className="media-status__label">{status.label}</span>
              </li>
              ))}
          </ul>
          : null
        }
      </div>
    );
  }
}

MediaStatus.propTypes = {
  intl: intlShape.isRequired
};

MediaStatus.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(MediaStatus);
