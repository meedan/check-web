import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import SettingsIcon from '@material-ui/icons/Settings';
import Menu from '@material-ui/core/Menu';
import MultiSelector from '../layout/MultiSelector';

const SearchKeywordConfig = ({
  query,
  onChange,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handleClose = () => setAnchorEl(null);

  const handleChange = (values) => {
    const fields = [];
    const team_tasks = [];
    const keyword_fields = {};

    values.forEach((v) => {
      if (parseInt(v, 10)) {
        team_tasks.push(v);
      } else {
        fields.push(v);
      }
    });

    if (fields.length) {
      keyword_fields.fields = fields;
    }
    if (team_tasks.length) {
      keyword_fields.team_tasks = team_tasks;
    }

    onChange({ keyword_fields });
    handleClose();
  };

  let selected = [];
  if (query.keyword_fields) {
    if (query.keyword_fields.fields) {
      selected = selected.concat(query.keyword_fields.fields);
    }
    if (query.keyword_fields.team_tasks) {
      selected = selected.concat(query.keyword_fields.team_tasks);
    }
  }

  const options = [{
    value: 'title',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.mediaTitle"
        defaultMessage="Media title"
      />
    ),
  },
  {
    value: 'description',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.mediaContent"
        defaultMessage="Media content"
      />
    ),
  },
  {
    value: 'analysis_title',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.analysisTitle"
        defaultMessage="Analysis title"
      />
    ),
  },
  {
    value: 'analysis_description',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.analysisContent"
        defaultMessage="Analysis content"
      />
    ),
  },
  {
    value: 'tags',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.tags"
        defaultMessage="Tags"
      />
    ),
  },
  {
    value: '',
    label: '',
  },
  {
    value: 'task_answers',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.allTaskAnswers"
        defaultMessage="All tasks answers"
      />
    ),
  },
  {
    value: 'metadata_answers',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.allMetadataAnswers"
        defaultMessage="All metadata answers"
      />
    ),
  },
  {
    value: 'comments',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.allNotes"
        defaultMessage="All notes"
      />
    ),
  },
  {
    value: 'task_comments',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.allTaskComments"
        defaultMessage="All task comments"
      />
    ),
  }];

  return (
    <React.Fragment>
      <SettingsIcon onClick={e => setAnchorEl(e.target)} />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MultiSelector
          allowSelectAll
          allowUnselectAll
          options={options}
          selected={selected}
          onDismiss={handleClose}
          onSubmit={handleChange}
        />
      </Menu>
    </React.Fragment>
  );
};

SearchKeywordConfig.propTypes = {
  query: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SearchKeywordConfig;
