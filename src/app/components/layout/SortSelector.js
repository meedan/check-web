import React from 'react';
import { FormattedMessage } from 'react-intl';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import OutlinedInput from '@material-ui/core/OutlinedInput';

class SortSelector extends React.PureComponent {
  render() {
    return (
      <FormControl variant="outlined" fullWidth>
        <Select
          className="sort-select"
          input={<OutlinedInput name="sort-select" labelWidth={0} />}
          {...this.props}
        >
          <MenuItem value="az">
            <FormattedMessage id="sortSelect.az" defaultMessage="A to Z" />
          </MenuItem>
          <MenuItem value="za">
            <FormattedMessage id="sortSelect.za" defaultMessage="Z to A" />
          </MenuItem>
          <MenuItem value="of">
            <FormattedMessage id="sortSelect.of" defaultMessage="Oldest first" />
          </MenuItem>
          <MenuItem value="nf">
            <FormattedMessage id="sortSelect.nf" defaultMessage="Newest first" />
          </MenuItem>
          <MenuItem value="mu">
            <FormattedMessage id="sortSelect.mu" defaultMessage="Most used" />
          </MenuItem>
          <MenuItem value="lu">
            <FormattedMessage id="sortSelect.lu" defaultMessage="Least used" />
          </MenuItem>
        </Select>
      </FormControl>
    );
  }
}

export default SortSelector;
