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
}) => {
  const [localSelected, setLocalSelected] = React.useState(selected);

  const { channels } = about;
  console.log('channels', channels);
  let options = Object.keys(channels).map(key => ({ label: key, value: `${channels[key]}` })).filter(c => c.label !== 'TIPLINE');
  options = options.concat([{ label: 'All tiplines', value: 'all_tiplines' }, { label: '', value: '' }]);

  const tiplines = Object.keys(channels.TIPLINE).map(key => ({ label: key, value: `${channels.TIPLINE[key]}` }));
  options = options.concat(tiplines);

  console.log('options', options); // eslint-disable-line no-console

  const handleSelectChange = (sel) => {
    const newSelection = sel;
    const allTiplinesIndex = sel.findIndex(s => s === 'all_tiplines');
    if (allTiplinesIndex >= 0) {
      newSelection.splice(allTiplinesIndex, 1);
      tiplines.forEach((t) => {
        if (!newSelection.includes(t.value)) {
          newSelection.push(t.value);
        }
      });
    }
    console.log('newSelection', newSelection);
    setLocalSelected(newSelection);
  };

  return (
    <FormattedMessage id="SearchFieldChannel.label" defaultMessage="Channel is" description="Prefix label for field to filter by item channel">
      { label => (
        <MultiSelectFilter
          label={label}
          icon={<ForwardIcon />}
          selected={localSelected}
          options={options}
          onChange={(newValue) => { onChange(newValue); }}
          onRemove={onRemove}
          onSelectChange={handleSelectChange}
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
