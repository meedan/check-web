import React, { Component, PropTypes } from 'react';
import DocumentTitle from 'react-document-title';
import { defineMessages, injectIntl } from 'react-intl';
import { mapMessage } from './MappedMessage';
import config from 'config';

const messages = defineMessages({
  appNameHuman: {
    id: 'pageTitle.appNameHuman',
    defaultMessage: 'Check',
  },
  bridge_appNameHuman: {
    id: 'bridge.pageTitle.appNameHuman',
    defaultMessage: 'Bridge',
  },
});

class PageTitle extends Component {
  render() {

    let title = this.props.title;

    if (title === false) {
      return(<span>{this.props.children}</span>)
    }

    if (!title) {
      const appName = mapMessage(this.props.intl, messages, 'appNameHuman');
      let suffix = appName;

      if (!this.props.skipTeam) {
        try {
          suffix = `${this.props.team.name} ${appName}`;
        } catch (e) {
          if (!(e instanceof TypeError)) throw e;
        }
      }

      title = (this.props.prefix ? (`${this.props.prefix} | `) : '') + suffix;
    }

    return (
      <DocumentTitle title={title}>
        {this.props.children}
      </DocumentTitle>
    );
  }
}

export default injectIntl(PageTitle);
