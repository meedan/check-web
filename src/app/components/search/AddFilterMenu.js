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
  team,
  addedFields,
  hideOptions,
  showOptions,
  onSelect,
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
          id="addFilterMenu.annotation"
          defaultMessage="Annotation"
          description="Menu option to enable searching items by annotation fields"
        />
      ),
    },
    {
      id: 'add-filter-menu__annotated-by',
      key: 'annotated_by',
      icon: <PersonIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.annotatedBy"
          defaultMessage="Annotator"
          description="Menu option to enable searching items by annotated by"
        />
      ),
    },
    {
      id: 'add-filter-menu__time-assigned-to',
      key: 'assigned_to',
      icon: <PersonIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.assignedTo"
          defaultMessage="Assignment"
          description="Menu option to enable searching items by assigned users"
        />
      ),
    },
    {
      id: 'add-filter-menu__channel',
      key: 'channels',
      icon: <ForwardIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.channel"
          defaultMessage="Channel"
          description="Menu option to enable searching items by channel"
        />
      ),
    },
    {
      id: 'add-filter-menu__claim',
      key: 'has_claim',
      icon: <LabelIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.claim"
          defaultMessage="Claim"
          description="Menu option to enable searching items by claim"
        />
      ),
    },
    {
      id: 'add-filter-menu__created-by',
      key: 'users',
      icon: <PersonIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.createdBy"
          defaultMessage="Creator"
          description="Menu option to enable searching items by author"
        />
      ),
    },
    {
      id: 'add-filter-menu__time-range',
      key: 'range',
      icon: <DateRangeIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.timeRange"
          defaultMessage="Date"
          description="Menu option to enable searching items by date range"
        />
      ),
    },
    {
      id: 'add-filter-menu__feed-fact-checked-by',
      key: 'feed_fact_checked_by',
      icon: <HowToRegIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.feedFactCheckedBy"
          defaultMessage="Fact-checker"
          description="Menu option to enable searching feed items by whether they were fact-checked"
        />
      ),
    },
    {
      id: 'add-filter-menu__language',
      key: 'language_filter',
      icon: <LanguageIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.language"
          defaultMessage="Language"
          description="Menu option to enable searching items by language"
        />
      ),
    },
    {
      id: 'add-filter-menu__similar-medias',
      key: 'linked_items_count',
      icon: <NumberIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.similarMedias"
          defaultMessage="Media (count)"
          description="Menu option to enable searching items by matched medias"
        />
      ),
    },
    {
      id: 'add-filter-menu__media-type',
      key: 'show',
      icon: <DescriptionIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.mediaType"
          defaultMessage="Media (type)"
          description="Menu option to enable searching items by media type"
        />
      ),
    },
    ...(team.alegre_bot && team.alegre_bot.alegre_settings.master_similarity_enabled) ? [{
      id: 'add-filter-menu__show-similar',
      key: 'show_similar',
      icon: <UnmatchedIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.showSimilar"
          defaultMessage="Media (matched)"
          description="Menu option to enable individually displaying items with similar media"
        />
      ),
    }] : [],
    ...(team.alegre_bot && team.alegre_bot.alegre_settings.master_similarity_enabled) ? [{
      id: 'add-filter-menu__unmatched',
      key: 'unmatched',
      icon: <UnmatchedIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.unmatched"
          defaultMessage="Media (unmatched)"
          description="Menu option to enable searching items by whether they have media that has been unmatched at some point"
        />
      ),
    }] : [],
    {
      id: 'add-filter-menu__workspace',
      key: 'cluster_teams',
      icon: <CorporateFareIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.Workspace"
          defaultMessage="Organization"
          description="Menu option to enable searching items by workspace"
        />
      ),
    },
    {
      id: 'add-filter-menu__published-by',
      key: 'published_by',
      icon: <HowToRegIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.publishedBy"
          defaultMessage="Publisher"
          description="Menu option to enable searching items by report published by"
        />
      ),
    },
    {
      id: 'add-filter-menu__cluster-published-reports',
      key: 'cluster_published_reports',
      icon: <HowToRegIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.publishedBy"
          defaultMessage="Publisher"
          description="Menu option to enable searching items by report published by"
        />
      ),
    },
    {
      id: 'add-filter-menu__status',
      key: 'verification_status',
      icon: <LabelIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.itemStatus"
          defaultMessage="Rating"
          description="Menu option to enable searching items by item status"
        />
      ),
    },
    {
      id: 'add-filter-menu__read',
      key: 'read',
      icon: <MarkunreadIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.itemRead"
          defaultMessage="Read/unread"
          description="Menu option to enable searching items by item read/unread"
        />
      ),
    },
    {
      id: 'add-filter-menu__report-status',
      key: 'report_status',
      icon: <ReportIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.reportStatus"
          defaultMessage="Report (status)"
          description="Menu option to enable searching items by report status"
        />
      ),
    },
    {
      id: 'add-filter-menu__tipline-requests',
      key: 'demand',
      icon: <NumberIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.tiplineRequests"
          defaultMessage="Request (count)"
          description="Menu option to enable searching items by tipline requests"
        />
      ),
    },
    {
      id: 'add-filter-menu__tipline-request',
      key: 'archived',
      icon: <ErrorIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.tiplineRequest"
          defaultMessage="Request (status)"
          description="Menu option to enable searching items by confirmed/unconfirmed items"
        />
      ),
    },
    {
      id: 'add-filter-menu__time-source',
      key: 'sources',
      icon: <SettingsInputAntennaIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.source"
          defaultMessage="Source"
          description="Menu option to enable searching items by source"
        />
      ),
    },
    ...(team.alegre_bot && team.alegre_bot.alegre_settings.master_similarity_enabled) ? [{
      id: 'add-filter-menu__suggested-medias',
      key: 'suggestions_count',
      icon: <NumberIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.suggestedMedias"
          defaultMessage="Suggestions (count)"
          description="Menu option to enable searching items by suggestions"
        />
      ),
    }] : [],
    {
      id: 'add-filter-menu__tags',
      key: 'tags',
      icon: <LocalOfferIcon />,
      label: (
        <FormattedMessage
          id="addFilterMenu.tag"
          defaultMessage="Tag"
          description="Menu option to enable searching items by tags"
        />
      ),
    },
  ];

  return (
    <React.Fragment>
      <ButtonMain
        variant="contained"
        size="default"
        theme="text"
        iconLeft={<AddIcon />}
        onClick={e => setAnchorEl(e.currentTarget)}
        label={
          <FormattedMessage
            id="addFilterMenu.addFilter"
            defaultMessage="Filter"
            description="Button that opens menu with filter field options"
          />
        }
        buttonProps={{
          id: 'add-filter-menu__open-button',
        }}
      />
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem disabled>
          <FormattedMessage
            id="addFilterMenu.filterBy"
            defaultMessage="Filter by"
            description="Header to menu of filter field types"
          />
        </MenuItem>
        { options.map(o => (hideOptions.includes(o.key) || (showOptions.length > 0 && !showOptions.includes(o.key))) ? null : (
          <MenuItem
            id={o.id}
            key={o.key}
            onClick={() => handleSelect(o.key)}
            disabled={addedFields.includes(o.key)}
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
