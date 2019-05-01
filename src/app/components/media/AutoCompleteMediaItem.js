import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import AutoComplete from 'material-ui/AutoComplete';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import { nested } from '../../helpers';
import { stringHelper } from '../../customHelpers';

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
    if (query.length < 3 || this.state.searching) {
      return;
    }
    this.setState({ searching: true });

    const { media: { project: { dbid: projectId } } } = this.props;
    // eslint-disable-next-line no-useless-escape
    const queryString = `{ \\"keyword\\":\\"${query}\\", \\"projects\\":[${projectId}], \\"eslimit\\":10 }`;

    const init = {
      body: JSON.stringify({
        query: `
          query {
            search(query: "${queryString}") {
              team {
                name
              }
              medias(first: 5) {
                edges {
                  node {
                    id
                    dbid
                    title
                    relationships { sources_count, targets_count }
                    domain
                    embed
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
        const items = nested(['data', 'search', 'medias', 'edges'], response);

        const unrelatedItems = items.filter(item =>
          (item.node.relationships.targets_count + item.node.relationships.targets_count === 0) &&
          (item.node.dbid !== this.props.media.dbid));

        const searchResult = unrelatedItems.map(item => ({
          // text: MediaUtil.title(item.node, item.node.embed, this.props.intl),
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
      .catch(error => this.setState({ message: error.message, searching: false }));
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

export default injectIntl(AutoCompleteMediaItem);
