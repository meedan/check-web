import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import CircularProgress from '@material-ui/core/CircularProgress';
import ForwardIcon from '@material-ui/icons/Forward';
import MultiSelectFilter from '../MultiSelectFilter';

const SearchFieldChannelComponent = ({
  selected,
  onChange,
  onRemove,
  about,
  readOnly,
}) => {
  const { channels } = about;
  let options = Object.keys(channels).map(key => ({ label: key, value: `${channels[key]}` })).filter(c => c.label !== 'TIPLINE');
  options = options.concat([{ label: 'Any tipline', value: 'any_tipline' }, { label: '', value: '' }]);

  const tiplines = Object.keys(channels.TIPLINE).map(key => ({ label: key, value: `${channels.TIPLINE[key]}`, parent: 'any_tipline' }));
  options = options.concat(tiplines);

  return (
    <FormattedMessage id="SearchFieldChannel.label" defaultMessage="Channel is" description="Prefix label for field to filter by item channel">
      { label => (
        <MultiSelectFilter
          label={label}
          icon={<ForwardIcon />}
          selected={selected}
          options={options}
          onChange={value => onChange(value)}
          onRemove={onRemove}
          readOnly={readOnly}
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
      return <CircularProgress size={36} />;
    }}
  />
);

SearchFieldChannel.defaultProps = {
  selected: [],
};

SearchFieldChannel.propTypes = {
  selected: PropTypes.array,
  onChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default SearchFieldChannel;
