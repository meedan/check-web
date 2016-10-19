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
    return ' media-status__current--' + status.toLowerCase().replace(' ', '-');
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

  render() {
    const { media } = this.props;
    const status = media.last_status;

    return (
      <div className={this.bemClass('media-status', this.canUpdate(), '--editable')} onClick={this.toggleMediaStatusMenu.bind(this)}>
        <div className={this.bemClass('media-status__overlay', this.state.isMediaStatusMenuOpen, '--active')} onClick={this.toggleMediaStatusMenu.bind(this)}></div>

        <div className={'media-status__current' + this.currentStatusToClass(status)}>
          <i className="media-status__icon media-status__icon--circle / fa fa-circle"></i>
          <span className='media-status__label'>{status}</span>
          <Can permissions={media.permissions} permission="create Status">
            <i className="media-status__icon media-status__icon--caret / fa fa-caret-down"></i>
          </Can>
          <span className='media-status__message'>{this.state.message}</span>
        </div>
        <ul className={this.bemClass('media-status__menu', this.state.isMediaStatusMenuOpen, '--active')}>
          <li className={this.bemClass('media-status__menu-item', (status === 'undetermined'), '--current') + ' media-status__menu-item--undetermined'} onClick={this.handleStatusClick.bind(this, 'undetermined')}>
            <i className="media-status__icon media-status__icon--radio-button-selected / fa fa-circle"></i>
            <i className="media-status__icon media-status__icon--radio-button / fa fa-circle-o"></i>
            <span className='media-status__label'>Undetermined</span>
          </li>
          <li className={this.bemClass('media-status__menu-item', (status === 'in_progress'), '--current') + ' media-status__menu-item--in-progress'} onClick={this.handleStatusClick.bind(this, 'in_progress')}>
            <i className="media-status__icon media-status__icon--radio-button-selected / fa fa-circle"></i>
            <i className="media-status__icon media-status__icon--radio-button / fa fa-circle-o"></i>
            <span className='media-status__label'>In Progress</span>
          </li>
          <li className={this.bemClass('media-status__menu-item', (status === 'verified'), '--current') + ' media-status__menu-item--verified'} onClick={this.handleStatusClick.bind(this, 'verified')}>
            <i className="media-status__icon media-status__icon--radio-button-selected / fa fa-circle"></i>
            <i className="media-status__icon media-status__icon--radio-button / fa fa-circle-o"></i>
            <span className='media-status__label'>Verified</span>
          </li>
          <li className={this.bemClass('media-status__menu-item', (status === 'false'), '--current') + ' media-status__menu-item--false'} onClick={this.handleStatusClick.bind(this, 'false')}>
            <i className="media-status__icon media-status__icon--radio-button-selected / fa fa-circle"></i>
            <i className="media-status__icon media-status__icon--radio-button / fa fa-circle-o"></i>
            <span className='media-status__label'>False</span>
          </li>
        </ul>
      </div>
    );
  }
}

export default MediaStatus;
