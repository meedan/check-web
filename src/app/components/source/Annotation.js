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

    let content = JSON.parse(annotation.content);
    let template;
    switch (annotation.annotation_type) {
      case 'comment':
        content = content.text;
        template = (
          <div className="annotation annotation--comment" id={'annotation-' + annotation.dbid}>
            <div className='annotation__avatar' style={{backgroundImage: `url(${annotation.annotator.profile_image})`}}></div>
            <section className='annotation__content'>
              <div className='annotation__header'>
                <h4 className='annotation__author-name'>{annotation.annotator.name}</h4>
                <span className='annotation__timestamp'><TimeAgo date={annotation.created_at} live={false} /></span>
                <div className='annotation__actions'>
                  <button className='annotation__delete' onClick={this.handleDelete.bind(this, annotation.id)} title='Delete'>×</button>
                </div>
              </div>
              <div className='annotation__body'>{content}</div>
            </section>
          </div>
        );
        break;
      case 'status':
        const statusCode = content.status.toLowerCase().replace(' ', '-');
        template = (
          <div className="annotation annotation--status" id={'annotation-' + annotation.dbid}>
            <section className='annotation__content'>
              <div className='annotation__header'>
                <span>Status set to </span>
                <span className={`annotation__status annotation__status--${statusCode}`}>{content.status}</span>
                <span> by </span>
                <span className='annotation__author-name'>{annotation.annotator.name}</span> <span className='annotation__timestamp'><TimeAgo date={annotation.created_at} live={false} /></span>

                <div className='annotation__actions'>
                  <button className='annotation__delete' onClick={this.handleDelete.bind(this, annotation.id)} title='Delete'>×</button>
                </div>
              </div>
            </section>
          </div>
        );
        break;
      case 'tag':
        const message = `Tagged #${content.tag} by `;
        template = (
          <div className="annotation annotation--tag" id={'annotation-' + annotation.dbid}>
            <section className='annotation__content'>
              <div className='annotation__header'>
                <span>{message}</span>
                <span className='annotation__author-name'>{annotation.annotator.name}</span> <span className='annotation__timestamp'><TimeAgo date={annotation.created_at} live={false} /></span>

                <div className='annotation__actions'>
                  <button className='annotation__delete' onClick={this.handleDelete.bind(this, annotation.id)} title='Delete'>×</button>
                </div>
              </div>
            </section>
          </div>
        );
        break;
      case 'flag':
        template = (
          <div className="annotation annotation--flag" id={'annotation-' + annotation.dbid}>
            <section className='annotation__content'>
              <div className='annotation__header'>
                <span>Flagged as {content.flag} by </span>
                <span className='annotation__author-name'>{annotation.annotator.name}</span> <span className='annotation__timestamp'><TimeAgo date={annotation.created_at} live={false} /></span>

                <div className='annotation__actions'>
                  <button className='annotation__delete' onClick={this.handleDelete.bind(this, annotation.id)} title='Delete'>×</button>
                </div>
              </div>
            </section>
          </div>
        );
        break;
      default:
        content = annotation.content;
        template = (
          <div className="annotation annotation--default" id={'annotation-' + annotation.dbid}>
            <div className='annotation__timeline-dot'></div>
            <section className='annotation__content'>
              <div className='annotation__header'>
                {content}
                <div className='annotation__actions'>
                  <button className='annotation__delete' onClick={this.handleDelete.bind(this, annotation.id)} title='Delete'>×</button>
                </div>
              </div>
            </section>
          </div>
        );
    }

    return template;
  }
}

export default Annotation;
