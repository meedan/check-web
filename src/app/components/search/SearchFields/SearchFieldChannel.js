/* eslint-disable react/sort-prop-types */
import React from 'react';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import Loader from '../../cds/loading/Loader';
import ForwardIcon from '../../../icons/forward.svg';
import MultiSelectFilter from '../MultiSelectFilter';
import CheckChannels from '../../../CheckChannels';

const messages = defineMessages({
  manual: {
    id: 'searchFieldChannel.manual',
    defaultMessage: 'Manual',
    description: 'Filter option that refers to items created manually',
  },
  browserExtension: {
    id: 'searchFieldChannel.browserExtension',
    defaultMessage: 'Browser extension',
    description: 'Filter option that refers to items created via the browser extension',
  },
  api: {
    id: 'searchFieldChannel.api',
    defaultMessage: 'API',
    description: 'Filter option that refers to items created via the API',
  },
  anyTipline: {
    id: 'searchFieldChannel.anyTipline',
    defaultMessage: 'Any tipline',
    description: 'Filter option that refers to items created via a tipline',
  },
  imported: {
    id: 'searchFieldChannel.imported',
    defaultMessage: 'Imported',
    description: 'Filter option that refers to items imported from external systems',
  },
  webForm: {
    id: 'searchFieldChannel.webForm',
    defaultMessage: 'Web Form',
    description: 'Filter option that refers to items created via a web form',
  },
  sharedDatabase: {
    id: 'searchFieldChannel.sharedFeed',
    defaultMessage: 'Shared Feed',
    description: 'Filter option that refers to items created from the shared feed.',
  },
});

const SearchFieldChannelComponent = ({
  about,
  intl,
  onChange,
  onRemove,
  page,
  query,
  readOnly,
}) => {
  const { channels } = about;

  const optionLabels = {
    MANUAL: intl.formatMessage(messages.manual),
    FETCH: intl.formatMessage(messages.imported),
    BROWSER_EXTENSION: intl.formatMessage(messages.browserExtension),
    API: intl.formatMessage(messages.api),
    ZAPIER: 'Zapier',
    WHATSAPP: 'WhatsApp',
    MESSENGER: 'Messenger',
    TWITTER: 'X (Twitter)',
    TELEGRAM: 'Telegram',
    VIBER: 'Viber',
    LINE: 'Line',
    INSTAGRAM: 'Instagram',
    WEB_FORM: intl.formatMessage(messages.webForm),
    SHARED_DATABASE: intl.formatMessage(messages.sharedDatabase),
  };

  let options = [];

  const nonTiplines = Object.keys(channels).filter(key => key !== 'TIPLINE').map(key => ({ label: optionLabels[key], value: `${channels[key]}` }));
  const tiplines = Object.keys(channels.TIPLINE).map(key => ({ label: optionLabels[key], value: `${channels.TIPLINE[key]}`, parent: 'any_tipline' }));

  if (page !== 'tipline-inbox' && page !== 'feed') {
    options = options.concat(nonTiplines);
  }

  options = options.concat([
    { label: intl.formatMessage(messages.anyTipline), value: 'any_tipline', hasChildren: true },
  ]);

  options = options.concat(tiplines);

  const handleChange = (channelIds) => {
    let channelIdsWithoutChildren = [...channelIds];
    if (channelIds.includes('any_tipline')) {
      const tiplineIds = tiplines.map(t => t.value);
      channelIdsWithoutChildren = channelIds.filter(channelId => !tiplineIds.includes(channelId));
    }
    onChange(channelIdsWithoutChildren);
  };

  let selectedChannels = [];
  if (page === 'tipline-inbox') {
    selectedChannels = [CheckChannels.ANYTIPLINE];
  }
  if (page === 'imported-fact-checks') {
    selectedChannels = [CheckChannels.FETCH];
  }

  return (
    <FormattedMessage defaultMessage="Channel is" description="Prefix label for field to filter by item channel" id="SearchFieldChannel.label">
      { label => (
        <MultiSelectFilter
          icon={<ForwardIcon />}
          label={label}
          options={options}
          readOnly={readOnly}
          selected={query.channels || selectedChannels}
          onChange={!readOnly ? handleChange : null}
          onRemove={!readOnly && (page !== 'tipline-inbox') ? onRemove : null}
        />
      )}
    </FormattedMessage>
  );
};

const SearchFieldChannel = parentProps => (
  <QueryRenderer
    environment={Relay.Store}
    query={graphql`
      query SearchFieldChannelQuery {
        about {
          channels
        }
      }
    `}
    render={({ error, props }) => {
      if (!error && props) {
        return (<SearchFieldChannelComponent {...parentProps} {...props} />);
      }

      // TODO: We need a better error handling in the future, standardized with other components
      return <Loader size="icon" theme="grey" variant="icon" />;
    }}
  />
);

SearchFieldChannel.defaultProps = {
  readOnly: false,
  page: '',
};

SearchFieldChannel.propTypes = {
  query: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  page: PropTypes.string,
  readOnly: PropTypes.bool,
};

export default injectIntl(SearchFieldChannel);
