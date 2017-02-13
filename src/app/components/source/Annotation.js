import React, { Component, PropTypes } from 'react';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import TimeAgo from 'react-timeago';
import Linkify from 'react-linkify';
import nl2br from 'react-nl2br';
import MediaDetail from '../media/MediaDetail';
import DeleteAnnotationMutation from '../../relay/DeleteAnnotationMutation';
import DeleteStatusMutation from '../../relay/DeleteStatusMutation';
import DeleteVersionMutation from '../../relay/DeleteVersionMutation';
import Can from '../Can';

const messages = defineMessages({
  error: {
    id: 'annotation.error',
    defaultMessage: 'Could not delete annotation'
  },
  deleteButton: {
    id: 'annotation.deleteButton',
    defaultMessage: 'Delete'
  }
});

class Annotation extends Component {
  handleDelete(id) {
    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = this.props.intl.formatMessage(messages.error);
      try {
        const json = JSON.parse(error.source);
        if (json.error) {
          message = json.error;
        }
      } catch (e) { }
      window.alert(message);
    };

    const onSuccess = (response) => {
    };

    // Either to destroy status or annotations
    const destroy_attr = {
      parent_type: this.props.annotatedType.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
      annotated: this.props.annotated,
      id,
    };
    if (this.props.annotation.annotation_type === 'status') {
      // Destroy version or status
      if (this.props.annotation.version === null) {
        destroy_attr.id = this.props.annotated.last_status_obj.id;
        Relay.Store.commitUpdate(
          new DeleteStatusMutation(destroy_attr),
          { onSuccess, onFailure },
        );
      } else {
        destroy_attr.id = this.props.annotation.version.id;
        Relay.Store.commitUpdate(
          new DeleteVersionMutation(destroy_attr),
          { onSuccess, onFailure },
        );
      }
    } else {
      Relay.Store.commitUpdate(
        new DeleteAnnotationMutation(destroy_attr),
        { onSuccess, onFailure },
      );
    }

  }

  statusIdToLabel(id) {
    const statuses = JSON.parse(this.props.annotated.verification_statuses).statuses;
    let label = '';
    statuses.forEach((status) => {
      if (status.id === id) {
        label = status.label;
      }
    });
    return label;
  }

  updatedAt(annotation) {
    let date = new Date(annotation.updated_at);
    if (isNaN(date)) date = null;
    return date;
  }

  render() {
    const annotation = this.props.annotation;
    const permissionType = `${annotation.annotation_type.charAt(0).toUpperCase()}${annotation.annotation_type.slice(1)}`;
    const annotationActions = (
      <div className="annotation__actions">
        <Can permissions={annotation.permissions} permission={`destroy ${permissionType}`}>
          <button className="annotation__delete" onClick={this.handleDelete.bind(this, annotation.id)} title={this.props.intl.formatMessage(messages.deleteButton)}>×</button>
        </Can>
      </div>
    );
    const updatedAt = this.updatedAt(annotation);
    const content = JSON.parse(annotation.content);
    let contentTemplate;

    switch (annotation.annotation_type) {
    case 'comment':
      const commentText = content.text;
      contentTemplate = (
        <section className="annotation__content">
          <div className="annotation__header">
            <h4 className="annotation__author-name">{annotation.annotator.name}</h4>
            {updatedAt ? <span className="annotation__timestamp"><TimeAgo date={updatedAt} live={false} /></span> : null}
            {annotationActions}
          </div>
          <div className="annotation__body"><Linkify properties={{ target: '_blank' }}>{nl2br(commentText)}</Linkify></div>
          {annotation.medias.edges.map(media => (
            <div className="annotation__embedded-media">
              <MediaDetail media={media.node} condensed readonly />
            </div>
              ))}
        </section>
        );
      break;
    case 'status':
      const statusCode = content.status.toLowerCase().replace(/[ _]/g, '-');
      contentTemplate = (
        <section className="annotation__content">
          <div className="annotation__header">
            <FormattedMessage id="annotation.statusSetHeader"
                  defaultMessage={`Status set to {status} by {author}`}
                          values={{ status: <span className={`annotation__status annotation__status--${statusCode}`}>{this.statusIdToLabel(content.status)}</span>,
                                    author: <span className="annotation__author-name">{annotation.annotator.name}</span> }} />
            {updatedAt ? <span className="annotation__timestamp"><TimeAgo date={updatedAt} live={false} /></span> : null}
            {annotationActions}
          </div>
        </section>
        );
      break;
    case 'tag':
      contentTemplate = (
        <section className="annotation__content">
          <div className="annotation__header">
            <FormattedMessage id="annotation.taggedHeader"
                  defaultMessage={`Tagged #{tag} by {author}`}
                  values={{ tag: content.tag.replace(/^#/, ''), author: <span className="annotation__author-name">{annotation.annotator.name}</span> }} />
            {updatedAt ? <span className="annotation__timestamp"><TimeAgo date={updatedAt} live={false} /></span> : null}
            {annotationActions}
          </div>
        </section>
        );
      break;
    case 'flag':
      contentTemplate = (
        <section className="annotation__content">
          <div className="annotation__header">
            <FormattedMessage id="annotation.flaggedHeader"
                  defaultMessage={`Flagged as {flag} by {author}`}
                  values={{ flag: content.flag, author: <span className="annotation__author-name">{annotation.annotator.name}</span> }} />
            {updatedAt ? <span className="annotation__timestamp"><TimeAgo date={updatedAt} live={false} /></span> : null}
            {annotationActions}
          </div>
        </section>
        );
      break;
    }

    return (
      <div className={`annotation annotation--${annotation.annotation_type}`} id={`annotation-${annotation.dbid}`}>
        {annotation.annotation_type === 'comment' ? (
          <div className="annotation__avatar" style={{ backgroundImage: `url(${annotation.annotator.profile_image})` }} />
        ) : null}
        {contentTemplate}
      </div>
    );
  }
}

Annotation.propTypes = {
  intl: intlShape.isRequired
};

export default injectIntl(Annotation);
