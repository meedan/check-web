import React, { Component, PropTypes } from 'react';
import FontAwesome from 'react-fontawesome';
import Relay from 'react-relay';
import CreateStatusMutation from '../../relay/CreateStatusMutation';
import Can, { can } from '../Can';

class MediaStatus extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMediaStatusMenuOpen: false,
      message: null
    };
  }

  canUpdate() {
    return can(this.props.media.permissions, "create Status");
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
    return ' media-status__current--' + status.toLowerCase().replace(/[ _]/g, '-');
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

    Relay.Store.commitUpdate(
      new CreateStatusMutation({
        parent_type: "media",
        annotated: media,
        annotation: {
          status: status,
          annotated_type: "Media",
          annotated_id: media.dbid
        }
      }),
      { onSuccess, onFailure }
    );
  }

  fail(transaction) {
    const that = this;
    transaction.getError().json().then(function(json) {
      let message = "We're sorry, but we encountered an error trying to update the status.";
      if (json.error) {
        message = json.error;
      }
      that.setState({ message: message });
    });
  }

  success(response) {
    // this.setState({ message: 'Status updated.' });
  }

  statusIdToLabel(id) {
    const statuses = JSON.parse(this.props.media.verification_statuses).statuses;
    let label = '';
    statuses.forEach(function(status) {
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
        <div className={this.bemClass('media-status__overlay', this.state.isMediaStatusMenuOpen, '--active')} onClick={this.toggleMediaStatusMenu.bind(this)}></div>

        <div className={'media-status__current' + this.currentStatusToClass(currentStatus)}>
          <i className="media-status__icon media-status__icon--circle / fa fa-circle"></i>
          <span className='media-status__label'>{currentStatus}</span>
          <Can permissions={media.permissions} permission="create Status">
            <i className="media-status__icon media-status__icon--caret / fa fa-caret-down"></i>
          </Can>
          <span className='media-status__message'>{this.state.message}</span>
        </div>
        <ul className={this.bemClass('media-status__menu', this.state.isMediaStatusMenuOpen, '--active')}>

          {statuses.map(function(status) {
            return (
              <li className={that.bemClass('media-status__menu-item', (media.last_status === status.id), '--current') + ' media-status__menu-item--' + status.id.replace('_', '-')} onClick={that.handleStatusClick.bind(that, status.id)}>
                <i className="media-status__icon media-status__icon--radio-button-selected / fa fa-circle"></i>
                <i className="media-status__icon media-status__icon--radio-button / fa fa-circle-o"></i>
                <span className='media-status__label'>{status.label}</span>
              </li>
            );
          })}

        </ul>
      </div>
    );
  }
}

export default MediaStatus;
