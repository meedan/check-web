import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import CheckContext from '../../CheckContext';
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
  static isPublished(media) {
    return (
      media.dynamic_annotation_report_design &&
      media.dynamic_annotation_report_design.data &&
      media.dynamic_annotation_report_design.data.state === 'published'
    );
  }

  constructor(props) {
    super(props);

    this.state = {
      searchResult: [],
      searching: false,
      openResultsPopup: false,
    };

    this.timer = null;
  }

  // eslint-disable-next-line class-methods-use-this
  handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  }

  handleSearchText(e) {
    const query = e.target.value;
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
                    dynamic_annotation_report_design: annotation(annotation_type: "report_design") {
                      id
                      data
                    }
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

        if (this.props.onlyPublished) {
          items = items.filter(item =>
            AutoCompleteMediaItem.isPublished(item.node));
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
        this.setState({
          searchResult,
          message,
          openResultsPopup: Boolean(searchResult.length),
        });
      })
      .catch(() => this.setState({
        message: this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') }),
        searching: false,
      }));
  };

  render() {
    const selectCallback = (e, obj) => {
      if (this.props.onSelect) {
        this.props.onSelect(obj);
      }
      this.setState({ openResultsPopup: false });
    };

    return (
      <div>
        <Autocomplete
          id="autocomplete-media-item"
          name="autocomplete-media-item"
          options={this.state.searchResult}
          open={this.state.openResultsPopup}
          getOptionLabel={option => option.text}
          renderInput={
            params => (<TextField
              label={
                <FormattedMessage
                  id="autoCompleteMediaItem.searchItem"
                  defaultMessage="Search"
                />
              }
              onKeyPress={this.handleKeyPress.bind(this)}
              onChange={this.handleSearchText.bind(this)}
              {...params}
            />)
          }
          onChange={selectCallback}
          onBlur={() => this.setState({ openResultsPopup: false })}
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
