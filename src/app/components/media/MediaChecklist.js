import React, { Component, PropTypes } from 'react';

class MediaChecklist extends Component {
  render() {
    return (
      <div className="media-checklist">
        <aside>
          <h3>Verification checklist</h3>
          <p>Here are some common steps in collaborative media verification. Complete as many tasks as you can so we have a complete, transparent record of our investigation.</p>
        </aside>
        <ul>
          <li>
            <h4>Who</h4> Who’s the contact? Indicate information like <em>@username</em> and <em>Email</em> or <em>Phone</em>.
          </li>
          <li>
            <h4>What</h4> What’s the issue? Clearly explain which facts are in question.
          </li>
          <li>
            <h4>Where</h4> Where’s the location? Indicate specific city names and regions.
          </li>
          <li>
            <h4>When</h4> When did it happen? Include a timestamp with time zone, like <em>9/11/2016 HH:MM PM EST</em>.
          </li>
          <li>
            <h4>Original</h4> Is this just a retweet? Indicate <em>Is original</em> or <em>Is not original</em> or <em>Unsure</em>.
          </li>
          <li>
            <h4>Details</h4> Anything else? Indicate additional info including social media exchanges or interviews.
          </li>
        </ul>
      </div>
    );
  }
}

export default MediaChecklist;
