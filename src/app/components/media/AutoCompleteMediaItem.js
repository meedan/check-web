import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import AutoComplete from 'material-ui/AutoComplete';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import CheckContext from '../../CheckContext';
import { nested } from '../../helpers';
import { stringHelper, mediaStatuses } from '../../customHelpers';

const messages = defineMessages({
  searching: {
    id: 'autoCompleteMediaItem.searching',
    defaultMessage: 'Searching...',
  },
  notFound: {
    id: 'autoCompleteMediaItem.notFound',
    defaultMessage: 'No matches found',
  },
  error: {
    id: 'autoCompleteMediaItem.error',
    defaultMessage: 'Sorry, an error occurred while searching. Please try again and contact {supportEmail} if the condition persists.',
  },
});

class AutoCompleteMediaItem extends React.Component {
  static isFinalStatus(media, status) {
    let isFinal = false;
    mediaStatuses(media).statuses.forEach((st) => {
      if (st.id === status && parseInt(st.completed, 10) === 1) {
        isFinal = true;
      }
    });
    return isFinal;
  }

  constructor(props) {
    super(props);

    this.state = {
      searchResult: [],
      searching: false,
    };

    this.timer = null;
  }

  // eslint-disable-next-line class-methods-use-this
  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  }

  handleSearchText(query, dataSource, params) {
    if (params.source === 'click') {
      return;
    }

    const keystrokeWait = 2000;
    this.setState({ message: '' });
    clearTimeout(this.timer);

    if (query) {
      this.setState({ message: this.props.intl.formatMessage(messages.searching) });
      this.timer = setTimeout(() => this.search(query), keystrokeWait);
    }
  }

  search = (query) => {
    const context = new CheckContext(this).getContextStore();

    if (query.length < 3 || this.state.searching) {
      return;
    }
    this.setState({ searching: true });

    // eslint-disable-next-line no-useless-escape
    const queryString = `{ \\"keyword\\": \\"${query}\\", \\"eslimit\\": 30 }`;

    const init = {
      body: JSON.stringify({
        query: `
          query {
            search(query: "${queryString}") {
              team {
                name
              }
              medias(first: 30) {
                edges {
                  node {
                    id
                    dbid
                    title
                    verification_statuses
                    status
                    relationships { sources_count, targets_count }
                    domain
                    metadata
                    overridden
                    media {
                      quote
                    }
                  }
                }
              }
            }
          }
        `,
      }),
      headers: {
        Accept: '*/*',
        'X-Check-Team': context.team.slug,
        'Content-Type': 'application/json',
        ...config.relayHeaders,
      },
      method: 'POST',
    };

    fetch(config.relayPath, init)
      .then((response) => {
        this.setState({ searching: false });
        if (!response.ok) {
          throw Error(this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') }));
        }
        return response.json();
      })
      .then((response) => {
        let items = nested(['data', 'search', 'medias', 'edges'], response);

        items = items.filter(item =>
          (item.node.relationships.sources_count + item.node.relationships.targets_count === 0) &&
          (item.node.dbid !== this.props.media.dbid));

        if (this.props.onlyFinal) {
          items = items.filter(item =>
            AutoCompleteMediaItem.isFinalStatus(item.node, item.node.status));
        }

        const searchResult = items.map(item => ({
          text: item.node.title,
          value: item.node.dbid,
          id: item.node.id,
        })) || [];

        let message = '';
        if (!searchResult.length) {
          message = this.props.intl.formatMessage(messages.notFound);
        }
        this.setState({ searchResult, message });
      })
      .catch(() => this.setState({
        message: this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') }),
        searching: false,
      }));
  };

  render() {
    const selectCallback = (obj) => {
      if (this.props.onSelect) {
        this.props.onSelect(obj);
      }
    };

    return (
      <div>
        <AutoComplete
          id="autocomplete-media-item"
          floatingLabelText={
            <FormattedMessage
              id="autoCompleteMediaItem.searchItem"
              defaultMessage="Search"
            />
          }
          name="autocomplete-media-item"
          dataSource={this.state.searchResult}
          filter={AutoComplete.noFilter}
          onKeyPress={this.handleKeyPress.bind(this)}
          onNewRequest={selectCallback}
          ref={(a) => { this.autoComplete = a; }}
          onUpdateInput={this.handleSearchText.bind(this)}
          fullWidth
        />
        <span>{this.state.message}</span>
      </div>
    );
  }
}

AutoCompleteMediaItem.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(AutoCompleteMediaItem);
