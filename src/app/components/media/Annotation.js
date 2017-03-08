import React, { Component, PropTypes } from 'react';
import { FormattedMessage, FormattedHTMLMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import Relay from 'react-relay';
import Linkify from 'react-linkify';
import nl2br from 'react-nl2br';
import MediaDetail from '../media/MediaDetail';
import DynamicAnnotation from '../annotations/DynamicAnnotation';
import DeleteAnnotationMutation from '../../relay/DeleteAnnotationMutation';
import DeleteVersionMutation from '../../relay/DeleteVersionMutation';
import Can from '../Can';
import TimeBefore from '../TimeBefore';
import { Link } from 'react-router';
import { getStatus, getStatusStyle } from '../../helpers';
import Lightbox from 'react-image-lightbox';

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
  constructor(props) {
    super(props);

    this.state = { zoomedCommentImage: false };
  }

  handleCloseCommentImage() {
    this.setState({ zoomedCommentImage: false });
  }
  
  handleOpenCommentImage(image) {
    this.setState({ zoomedCommentImage: image });
  }

  handleDelete(id) {
    const that = this;

    const onFailure = (transaction) => {
      const error = transaction.getError();
      let message = that.props.intl.formatMessage(messages.error);
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

    // Either to destroy versions or annotations
    const destroy_attr = {
      parent_type: this.props.annotatedType.replace(/([a-z])([A-Z])/, '$1_$2').toLowerCase(),
      annotated: this.props.annotated,
      id,
    };
    if (this.props.annotation.annotation.version === null) {
      Relay.Store.commitUpdate(
        new DeleteAnnotationMutation(destroy_attr),
        { onSuccess, onFailure },
      );
    } else {
      destroy_attr.id = this.props.annotation.annotation.version.id;
      Relay.Store.commitUpdate(
        new DeleteVersionMutation(destroy_attr),
        { onSuccess, onFailure },
      );
    }
  }

  updatedAt(activity) {
    let date = new Date(activity.created_at);
    if (isNaN(date)) date = null;
    return date;
  }

  render() {
    const activity = this.props.annotation;
    const annotation = activity.annotation;
    const annotated = this.props.annotated;

    let annotationActions = null;
    if (annotation) {
      let permissionType = `${annotation.annotation_type.charAt(0).toUpperCase()}${annotation.annotation_type.slice(1)}`;
      annotationActions = (
        <div className="annotation__actions">
          <Can permissions={annotation.permissions} permission={`destroy ${permissionType}`}>
            <button className="annotation__delete" onClick={this.handleDelete.bind(this, annotation.id)} title={this.props.intl.formatMessage(messages.deleteButton)}>×</button>
          </Can>
        </div>
      );
    }

    const updatedAt = this.updatedAt(activity);
    const object = JSON.parse(activity.object_after);
    const content = object.data;
    const activityType = activity.event_type;
    let contentTemplate = null;

    switch (activityType) {
    case 'create_comment':
      const commentText = content.text;
      const commentContent = JSON.parse(annotation.content);
      contentTemplate = (
        <section className="annotation__content">
          <div className="annotation__header">
            <h4 className="annotation__author-name">{activity.user.name}</h4>
            {updatedAt ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} /></span> : null}
            {annotationActions}
          </div>
          <div className="annotation__body annotation__comment">
            <span className="annotation__comment-text"><Linkify properties={{ target: '_blank' }}>{nl2br(commentText)}</Linkify></span>
            { commentContent.original ? 
              <img src={commentContent.thumbnail} alt="" onClick={this.handleOpenCommentImage.bind(this, commentContent.original)} /> 
            : null }
            <br />
          </div>
          {annotation.medias.edges.map(media => (
            <div className="annotation__embedded-media">
              <MediaDetail media={media.node} condensed readonly />
            </div>
          ))}

          { (commentContent.original && !!this.state.zoomedCommentImage) ? 
            <Lightbox onCloseRequest={this.handleCloseCommentImage.bind(this)} mainSrc={this.state.zoomedCommentImage} />
          : null }
        </section>
        );
      break;
    case 'update_status':
      const statusCode = content.status.toLowerCase().replace(/[ _]/g, '-');
      const status = getStatus(this.props.annotated.verification_statuses, content.status);
      contentTemplate = (
        <section className="annotation__content">
          <div className="annotation__header">
            <FormattedMessage id="annotation.statusSetHeader"
                  defaultMessage={`Status set to {status} by {author}`}
                          values={{ status: <span className={`annotation__status annotation__status--${statusCode}`} style={{color: getStatusStyle(status, 'color')}}>{status.label}</span>,
                                    author: <span className="annotation__author-name">{activity.user.name}</span> }} />
            {updatedAt ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} /></span> : null}
            {annotationActions}
          </div>
        </section>
        );
      break;
    case 'create_tag':
      contentTemplate = (
        <section className="annotation__content">
          <div className="annotation__header">
            <FormattedMessage id="annotation.taggedHeader"
                  defaultMessage={`Tagged #{tag} by {author}`}
                  values={{ tag: content.tag.replace(/^#/, ''), author: <span className="annotation__author-name">{activity.user.name}</span> }} />
            {updatedAt ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} /></span> : null}
            {annotationActions}
          </div>
        </section>
        );
      break;
    case 'create_task':
      contentTemplate = (
        <section className="annotation__content">
          <div className="annotation__header">
            <FormattedMessage id="annotation.taskCreated"
                  defaultMessage={`Task "{task}" created by {author}`}
                          values={{ task: content.label, author: <span className="annotation__author-name">{activity.user.name}</span> }} />
            {updatedAt ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} live={false} /></span> : null}
          </div>
        </section>
        );
      break;
    case 'create_dynamicannotationfield': case 'update_dynamicannotationfield':
      if (object.field_name === 'response_free_text' && activity.task) {
        contentTemplate = (
          <section className="annotation__content">
            <div className="annotation__header annotation__task-resolved">
              <FormattedMessage id="annotation.taskResolve"
                    defaultMessage={`Task "{task}" answered by {author}: {response} `}
                            values={{ task: activity.task.label, author: <span className="annotation__author-name">{activity.user.name}</span>, response: <em>{`"${object.value}"`}</em> }} />
              {updatedAt ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} live={false} /></span> : null}
            </div>
          </section>
        );
      }
      break;
    case 'create_flag':
      contentTemplate = (
        <section className="annotation__content">
          <div className="annotation__header">
            <FormattedMessage id="annotation.flaggedHeader"
                  defaultMessage={`Flagged as {flag} by {author}`}
                  values={{ flag: content.flag, author: <span className="annotation__author-name">{activity.user.name}</span> }} />
            {updatedAt ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} /></span> : null}
            {annotationActions}
          </div>
        </section>
        );
      break;
    case 'update_embed': case 'create_embed':
      if (content.title) {
        if (annotated.quote && annotated.quote === content.title) {
          contentTemplate = (
            <section className="annotation__content">
              <div className="annotation__header">
                <span>
                  <FormattedMessage id="annotation.newClaim" defaultMessage={`New claim added by {author}`}
                   values={{ author: <span className="annotation__author-name">{activity.user.name} </span> }} />
                </span>
                {updatedAt ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} /></span> : null}
                {annotationActions}
              </div>
            </section>
          );
        } else {
          contentTemplate = (
            <section className="annotation__content">
              <div className="annotation__header">
                <span>
                  <FormattedMessage id="annotation.titleChanged" defaultMessage={`Title changed to {title} by {author}`}
                   values={{ title: <b>{content.title}</b>, author: <span className="annotation__author-name">{activity.user.name} </span> }} />
                </span>
                {updatedAt ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} /></span> : null}
                {annotationActions}
              </div>
            </section>
          );
        }
      }
      break;
    case 'update_projectmedia':
      if (activity.projects.edges.length > 0 && activity.user) {
        const previousProject = activity.projects.edges[0].node;
        const currentProject = activity.projects.edges[1].node;
        const urlPrefix = `/${annotated.team.slug}/project/`;
        contentTemplate = (
          <section className="annotation__content">
            <div className="annotation__header">
              <span>
                <FormattedMessage id="annotation.projectMoved" defaultMessage={`Moved from project {previousProject} to {currentProject} by {author}`}
                values={{ previousProject: <Link to={urlPrefix + previousProject.dbid}><b>{previousProject.title}</b></Link>, currentProject: <Link to={urlPrefix + currentProject.dbid}><b>{currentProject.title}</b></Link>, author: <span className="annotation__author-name">{activity.user.name}</span> }} />
              </span>
              {updatedAt ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} /></span> : null}
              {annotationActions}
            </div>
          </section>
        );
      }
      break;
    case 'update_task':
      const changes = JSON.parse(activity.object_changes_json);
      if (changes.data) {
        let from = changes.data[0];
        let to = changes.data[1];
        let editedTitle = false;
        let editedNote = false;
        let createdNote = false;
        if (from.label && to.label && from.label != to.label) {
          editedTitle = true;
        }
        if (to.description && from.description != to.description) {
          editedNote = true;
        }
        if (!from.description && to.description) {
          editedNote = false;
          createdNote = true;
        }
        let author = (<span className="annotation__author-name">{activity.user.name}</span>);
        if (editedTitle || editedNote || createdNote) {
          contentTemplate = (
            <section className="annotation__content">
              <div className="annotation__header">
                <span className="annotation__update-task">
                  { editedTitle ? <FormattedMessage id="annotation.taskLabelUpdated" defaultMessage={`Task "{from}" edited to "{to}" by {author}`} values={{ from: from.label, to: to.label, author }} /> : null }
                  { editedNote ? <FormattedMessage id="annotation.taskNoteUpdated" defaultMessage={`Task "{title}" has note edited from "{from}" to "{to}" by {author}`} values={{ title: to.label, from: from.description, to: to.description, author }} /> : null }
                  { createdNote ? <FormattedMessage id="annotation.taskNoteCreated" defaultMessage={`Task "{title}" has new note "{note}" by {author}`} values={{ title: to.label, note: to.description, author }} /> : null }
                </span>
                {updatedAt ? <span className="annotation__timestamp"><TimeBefore date={updatedAt} /></span> : null}
                {annotationActions}
              </div>
            </section>
          );
        }
      }
      break;
    default:
      contentTemplate = null;
      break;
    }

    if (contentTemplate === null) {
      return null;
    }

    const className = annotation ? `annotation--${annotation.annotation_type}` : '';
    return (
      <div className={`annotation ${className}`} id={`annotation-${activity.dbid}`}>
        {activityType === 'create_comment' ? (
          <div className="annotation__avatar" style={{ backgroundImage: `url(${activity.user.profile_image})` }} />
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
