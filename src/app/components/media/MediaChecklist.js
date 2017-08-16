import React, { Component } from 'react';
import { FormattedHTMLMessage, FormattedMessage } from 'react-intl';

class MediaChecklist extends Component {
  render() {
    return (
      <div className="media-checklist">
        <aside>
          <h3>
            <FormattedMessage id="mediaChecklist.heading" defaultMessage="Verification checklist" />
          </h3>
          <p>
            <FormattedMessage
              id="mediaChecklist.instructions"
              defaultMessage="Here are some common steps in collaborative media verification. Complete as many tasks as you can so we have a complete, transparent record of our investigation."
            />
          </p>
        </aside>
        <ul>
          <li>
            <h4><FormattedMessage id="mediaChecklist.headingWho" defaultMessage="Who" />&nbsp;</h4>
            <FormattedHTMLMessage
              id="mediaChecklist.messageWho"
              defaultMessage="Who’s the contact? Indicate information like <em>@username</em> and <em>Email</em> or <em>Phone</em>"
            />.
          </li>
          <li>
            <h4>
              <FormattedMessage id="mediaChecklist.headingWhat" defaultMessage="What" />&nbsp;
            </h4>
            <FormattedMessage
              id="mediaChecklist.messageWhat"
              defaultMessage="What’s the issue? Clearly explain which facts are in question."
            />
          </li>
          <li>
            <h4>
              <FormattedMessage id="mediaChecklist.headingWhere" defaultMessage="Where" />&nbsp;
            </h4>
            <FormattedMessage
              id="mediaChecklist.messageWhere"
              defaultMessage="Where’s the location? Indicate specific city names and regions."
            />
          </li>
          <li>
            <h4>
              <FormattedMessage id="mediaChecklist.headingWhen" defaultMessage="When" />&nbsp;
            </h4>
            <FormattedHTMLMessage
              id="mediaChecklist.messageWhen"
              defaultMessage="When did it happen? Include a timestamp with time zone, like <em>9/11/2016 HH:MM PM EST</em>."
            />
          </li>
          <li>
            <h4>
              <FormattedMessage
                id="mediaChecklist.headingOriginal"
                defaultMessage="Original"
              />&nbsp;
            </h4>
            <FormattedHTMLMessage
              id="mediaChecklist.messageOriginal"
              defaultMessage="Is this just a retweet? Indicate <em>Is original</em> or <em>Is not original</em> or <em>Unsure</em>."
            />
          </li>
          <li>
            <h4>
              <FormattedMessage id="mediaChecklist.headingDetails" defaultMessage="Details" />&nbsp;
            </h4>
            <FormattedMessage
              id="mediaChecklist.messageDetails"
              defaultMessage="Anything else? Indicate additional info including social media exchanges or interviews."
            />
          </li>
        </ul>
      </div>
    );
  }
}

export default MediaChecklist;
