import React, { Component, PropTypes } from 'react';
import Pusher from 'pusher-js';
import DocumentTitle from 'react-document-title';
import MediaDetail from './MediaDetail';
import util from './MediaUtil';
import { Annotations, Tags } from '../source';
import config from 'config';
import { pageTitle } from '../../helpers';

class MediaComponent extends Component {
  setCurrentContext() {
    this.props.relay.setVariables({ contextId: Checkdesk.context.project.dbid });
  }

  componentDidMount() {
    this.setCurrentContext();
    this.scrollToAnnotation();
    this.subscribe();
  }

  componentDidUpdate() {
    this.setCurrentContext();
    this.scrollToAnnotation();
  }

  scrollToAnnotation() {
    if (window.location.hash != '') {
      var id = window.location.hash.replace(/^#/, ''),
          element = document.getElementById(id);
      if (element.scrollIntoView != undefined) {
        element.scrollIntoView();
      }
    }
  }

  subscribe() {
    if (window.Checkdesk.pusher) {
      const that = this;
      window.Checkdesk.pusher.subscribe(this.props.media.pusher_channel).bind('media_updated', function(data) {
        var annotation = JSON.parse(data.message);
        if (parseInt(annotation.context_id) === Checkdesk.context.project.dbid) {
          that.props.relay.forceFetch();
        }
      });
    }
  }

  unsubscribe() {
    if (window.Checkdesk.pusher) {
      window.Checkdesk.pusher.unsubscribe(this.props.media.pusher_channel);
    }
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    const media = this.props.media;
    const data = JSON.parse(media.jsondata);

    if (this.props.relay.variables.contextId === null) {
      return null;
    }

    return (
      <DocumentTitle title={pageTitle(util.title(media, data))}>
        <div className="media" data-id={media.dbid}>
          <article className='media__contents'>

            <MediaDetail media={media} />
            <h3 className='media__notes-heading'>Verification Timeline</h3>
            <Annotations annotations={media.annotations.edges.reverse()} annotated={media} annotatedType="Media" />

              <div className="electionland-checklist">
                <aside>
                  <h3><img className="electionland-logo" width="20" src="/images/Electionland_small.svg" alt=" " title=" " /> Electionland essential verification checklist</h3>
                  <p>Look for these things in your work. See the full <a href="https://sites.google.com/site/fdelectionland/election-day-feeder-desk/verification-checklist-feeders">checklist</a>. Reports discovered via social media are meant solely as tips. Always contact the source before sharing publicly.</p>
                </aside>
                <ul>
                  <li>
                    <h4>Who</h4> Who’s the contact? Indicate information like <em>@username</em> and <em>Email</em> or <em>Phone</em>
                  </li>
                  <li>
                    <h4>What</h4> What’s the voting issue? Choose a category like <em>Long lines</em> via the <span className="fa fa-ellipsis-h"></span> button at top right
                  </li>
                  <li>
                    <h4>Where</h4> Where’s the location? Indicate state, city and polling station like <em>#ma-boston-cityhall</em>
                  </li>
                  <li>
                    <h4>When</h4> When did it happen? Include a timestamp like <em>9/11/2016 HH:MM PM EST</em>
                  </li>
                  <li>
                    <h4>Original</h4> Is this just a retweet? Indicate <em>Is original</em> or <em>Is not original</em> or <em>Unsure</em>
                  </li>
                  <li>
                    <h4>Details</h4> Anything else? Indicate additional info including social media exchanges or interviews
                  </li>
                </ul>
              </div>

          </article>
        </div>
      </DocumentTitle>
    );
  }
}

export default MediaComponent;
