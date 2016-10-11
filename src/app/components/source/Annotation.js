import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import TimeAgo from 'react-timeago';
import DeleteAnnotationMutation from '../../relay/DeleteAnnotationMutation';

class Annotation extends Component {
  handleDelete(id) {
    var onFailure = (transaction) => {
      transaction.getError().json().then(function(json) {
        var message = 'Could not delete annotation';
        if (json.error) {
          message = json.error;
        }
        window.alert(message);
      });
    };

    var onSuccess = (response) => {
    };

    Relay.Store.commitUpdate(
      new DeleteAnnotationMutation({
        parent_type: this.props.annotatedType.toLowerCase(),
        annotated: this.props.annotated,
        id: id
      }),
      { onSuccess, onFailure }
    );
  }

  render() {
    const annotation = this.props.annotation;
    const annotationActions = (
      <div className='annotation__actions'>
        <button className='annotation__delete' onClick={this.handleDelete.bind(this, annotation.id)} title='Delete'>×</button>
      </div>
    );
    let content = JSON.parse(annotation.content);
    let contentTemplate;

    switch (annotation.annotation_type) {
      case 'comment':
        const commentText = content.text;
        contentTemplate = (
          <section className='annotation__content'>
            <div className='annotation__header'>
              <h4 className='annotation__author-name'>{annotation.annotator.name}</h4>
              <span className='annotation__timestamp'><TimeAgo date={annotation.created_at} live={false} /></span>
              {annotationActions}
            </div>
            <div className='annotation__body'>{commentText}</div>
          </section>
        );
        break;
      case 'status':
        const statusCode = content.status.toLowerCase().replace(' ', '-');
        contentTemplate = (
          <section className='annotation__content'>
            <div className='annotation__header'>
              <span>Status set to </span>
              <span className={`annotation__status annotation__status--${statusCode}`}>{content.status}</span>
              <span> by </span>
              <span className='annotation__author-name'>{annotation.annotator.name}</span> <span className='annotation__timestamp'><TimeAgo date={annotation.created_at} live={false} /></span>
              {annotationActions}
            </div>
          </section>
        );
        break;
      case 'tag':
        const message = `Tagged #${content.tag} by `;
        contentTemplate = (
          <section className='annotation__content'>
            <div className='annotation__header'>
              <span>{message}</span>
              <span className='annotation__author-name'>{annotation.annotator.name}</span> <span className='annotation__timestamp'><TimeAgo date={annotation.created_at} live={false} /></span>
              {annotationActions}
            </div>
          </section>
        );
        break;
      case 'flag':
        contentTemplate = (
          <section className='annotation__content'>
            <div className='annotation__header'>
              <span>Flagged as {content.flag} by </span>
              <span className='annotation__author-name'>{annotation.annotator.name}</span> <span className='annotation__timestamp'><TimeAgo date={annotation.created_at} live={false} /></span>
              {annotationActions}
            </div>
          </section>
        );
        break;
      default:
        content = annotation.content;
        contentTemplate = (
          <section className='annotation__content'>
            <div className='annotation__header'>
              {content}
              {annotationActions}
            </div>
          </section>
        );
    }

    return (
      <div className={`annotation annotation--${annotation.annotation_type}`} id={'annotation-' + annotation.dbid}>
        {annotation.annotation_type === 'comment' ? (
          <div className='annotation__avatar' style={{backgroundImage: `url(${annotation.annotator.profile_image})`}}></div>
        ) : null}
        {contentTemplate}
      </div>
    )
  }
}

export default Annotation;
