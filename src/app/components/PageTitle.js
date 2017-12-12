import React, { Component, PropTypes } from 'react';
import DocumentTitle from 'react-document-title';
import { defineMessages, injectIntl } from 'react-intl';
import { mapGlobalMessage } from './MappedMessage';

class PageTitle extends Component {
  render() {
    let title = this.props.title;

    if (!title) {
      const appName = mapGlobalMessage(this.props.intl, 'appNameHuman');
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
