import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import AddIcon from '../../icons/add.svg';
import NumberIcon from '../../icons/numbers.svg';
import CorporateFareIcon from '../../icons/corporate_fare.svg';
import DateRangeIcon from '../../icons/calendar_month.svg';
import DescriptionIcon from '../../icons/description.svg';
import ErrorIcon from '../../icons/error_outline.svg';
import ForwardIcon from '../../icons/forward.svg';
import HowToRegIcon from '../../icons/person_check.svg';
import LabelIcon from '../../icons/label.svg';
import LanguageIcon from '../../icons/language.svg';
import LocalOfferIcon from '../../icons/local_offer.svg';
import MarkunreadIcon from '../../icons/mail.svg';
import NoteAltIcon from '../../icons/note_alt.svg';
import PersonIcon from '../../icons/person.svg';
import ReportIcon from '../../icons/playlist_add_check.svg';
import SettingsInputAntennaIcon from '../../icons/settings_input_antenna.svg';
import UnmatchedIcon from '../../icons/unmatched.svg';

const AddFilterMenu = ({
  addedFields,
  hideOptions,
  onSelect,
  showOptions,
  team,
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleSelect = (field) => {
    setAnchorEl(null);
    onSelect(field);
  };

  const options = [
    {
      id: 'add-filter-menu__team-tasks',
      key: 'team_tasks',
      icon: <NoteAltIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Annotation"
          description="Menu option to enable searching items by annotation fields"
          id="addFilterMenu.annotation"
        />
      ),
    },
    {
      id: 'add-filter-menu__annotated-by',
      key: 'annotated_by',
      icon: <PersonIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Annotator"
          description="Menu option to enable searching items by annotated by"
          id="addFilterMenu.annotatedBy"
        />
      ),
    },
    {
      id: 'add-filter-menu__time-assigned-to',
      key: 'assigned_to',
      icon: <PersonIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Assignment"
          description="Menu option to enable searching items by assigned users"
          id="addFilterMenu.assignedTo"
        />
      ),
    },
    {
      id: 'add-filter-menu__channel',
      key: 'channels',
      icon: <ForwardIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Channel"
          description="Menu option to enable searching items by channel"
          id="addFilterMenu.channel"
        />
      ),
    },
    {
      id: 'add-filter-menu__claim',
      key: 'has_claim',
      icon: <LabelIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Claim"
          description="Menu option to enable searching items by claim"
          id="addFilterMenu.claim"
        />
      ),
    },
    {
      id: 'add-filter-menu__created-by',
      key: 'users',
      icon: <PersonIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Creator"
          description="Menu option to enable searching items by author"
          id="addFilterMenu.createdBy"
        />
      ),
    },
    {
      id: 'add-filter-menu__time-range',
      key: 'range',
      icon: <DateRangeIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Date"
          description="Menu option to enable searching items by date range"
          id="addFilterMenu.timeRange"
        />
      ),
    },
    {
      id: 'add-filter-menu__feed-fact-checked-by',
      key: 'feed_fact_checked_by',
      icon: <HowToRegIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Fact-checker"
          description="Menu option to enable searching feed items by whether they were fact-checked"
          id="addFilterMenu.feedFactCheckedBy"
        />
      ),
    },
    {
      id: 'add-filter-menu__language',
      key: 'language_filter',
      icon: <LanguageIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Language"
          description="Menu option to enable searching items by language"
          id="addFilterMenu.language"
        />
      ),
    },
    {
      id: 'add-filter-menu__similar-medias',
      key: 'linked_items_count',
      icon: <NumberIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Media (count)"
          description="Menu option to enable searching items by matched medias"
          id="addFilterMenu.similarMedias"
        />
      ),
    },
    {
      id: 'add-filter-menu__media-type',
      key: 'show',
      icon: <DescriptionIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Media (type)"
          description="Menu option to enable searching items by media type"
          id="addFilterMenu.mediaType"
        />
      ),
    },
    ...(team.alegre_bot && team.alegre_bot.alegre_settings.master_similarity_enabled) ? [{
      id: 'add-filter-menu__show-similar',
      key: 'show_similar',
      icon: <UnmatchedIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Media (matched)"
          description="Menu option to enable individually displaying items with similar media"
          id="addFilterMenu.showSimilar"
        />
      ),
    }] : [],
    ...(team.alegre_bot && team.alegre_bot.alegre_settings.master_similarity_enabled) ? [{
      id: 'add-filter-menu__unmatched',
      key: 'unmatched',
      icon: <UnmatchedIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Media (unmatched)"
          description="Menu option to enable searching items by whether they have media that has been unmatched at some point"
          id="addFilterMenu.unmatched"
        />
      ),
    }] : [],
    {
      id: 'add-filter-menu__workspace',
      key: 'cluster_teams',
      icon: <CorporateFareIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Organization"
          description="Menu option to enable searching items by workspace"
          id="addFilterMenu.Workspace"
        />
      ),
    },
    {
      id: 'add-filter-menu__published-by',
      key: 'published_by',
      icon: <HowToRegIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Publisher"
          description="Menu option to enable searching items by report published by"
          id="addFilterMenu.publishedBy"
        />
      ),
    },
    {
      id: 'add-filter-menu__cluster-published-reports',
      key: 'cluster_published_reports',
      icon: <HowToRegIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Publisher"
          description="Menu option to enable searching items by report published by"
          id="addFilterMenu.publishedBy"
        />
      ),
    },
    {
      id: 'add-filter-menu__status',
      key: 'verification_status',
      icon: <LabelIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Rating"
          description="Menu option to enable searching items by item status"
          id="addFilterMenu.itemStatus"
        />
      ),
    },
    {
      id: 'add-filter-menu__read',
      key: 'read',
      icon: <MarkunreadIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Read/unread"
          description="Menu option to enable searching items by item read/unread"
          id="addFilterMenu.itemRead"
        />
      ),
    },
    {
      id: 'add-filter-menu__report-status',
      key: 'report_status',
      icon: <ReportIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Report (status)"
          description="Menu option to enable searching items by report status"
          id="addFilterMenu.reportStatus"
        />
      ),
    },
    {
      id: 'add-filter-menu__tipline-requests',
      key: 'demand',
      icon: <NumberIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Request (count)"
          description="Menu option to enable searching items by tipline requests"
          id="addFilterMenu.tiplineRequests"
        />
      ),
    },
    {
      id: 'add-filter-menu__tipline-request',
      key: 'archived',
      icon: <ErrorIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Request (status)"
          description="Menu option to enable searching items by confirmed/unconfirmed items"
          id="addFilterMenu.tiplineRequest"
        />
      ),
    },
    {
      id: 'add-filter-menu__time-source',
      key: 'sources',
      icon: <SettingsInputAntennaIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Source"
          description="Menu option to enable searching items by source"
          id="addFilterMenu.source"
        />
      ),
    },
    ...(team.alegre_bot && team.alegre_bot.alegre_settings.master_similarity_enabled) ? [{
      id: 'add-filter-menu__suggested-medias',
      key: 'suggestions_count',
      icon: <NumberIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Suggestions (count)"
          description="Menu option to enable searching items by suggestions"
          id="addFilterMenu.suggestedMedias"
        />
      ),
    }] : [],
    {
      id: 'add-filter-menu__tags',
      key: 'tags',
      icon: <LocalOfferIcon />,
      label: (
        <FormattedMessage
          defaultMessage="Tag"
          description="Menu option to enable searching items by tags"
          id="addFilterMenu.tag"
        />
      ),
    },
  ];

  return (
    <React.Fragment>
      <ButtonMain
        buttonProps={{
          id: 'add-filter-menu__open-button',
        }}
        iconLeft={<AddIcon />}
        label={
          <FormattedMessage
            defaultMessage="Filter"
            description="Button that opens menu with filter field options"
            id="addFilterMenu.addFilter"
          />
        }
        size="default"
        theme="text"
        variant="contained"
        onClick={e => setAnchorEl(e.currentTarget)}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem disabled>
          <FormattedMessage
            defaultMessage="Filter by"
            description="Header to menu of filter field types"
            id="addFilterMenu.filterBy"
          />
        </MenuItem>
        { options.map(o => (hideOptions.includes(o.key) || (showOptions.length > 0 && !showOptions.includes(o.key))) ? null : (
          <MenuItem
            disabled={addedFields.includes(o.key)}
            id={o.id}
            key={o.key}
            onClick={() => handleSelect(o.key)}
          >
            <ListItemIcon>
              {o.icon}
            </ListItemIcon>
            {o.label}
          </MenuItem>
        )) }
      </Menu>
    </React.Fragment>
  );
};

AddFilterMenu.defaultProps = {
  addedFields: [],
  hideOptions: [],
  showOptions: [],
  team: {},
};

AddFilterMenu.propTypes = {
  addedFields: PropTypes.arrayOf(PropTypes.string),
  hideOptions: PropTypes.arrayOf(PropTypes.string),
  showOptions: PropTypes.arrayOf(PropTypes.string),
  team: PropTypes.object,
  onSelect: PropTypes.func.isRequired,
};

export default AddFilterMenu;
