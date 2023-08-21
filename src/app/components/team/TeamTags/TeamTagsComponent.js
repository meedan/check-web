import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import cx from 'classnames/bind';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import SearchField from '../../search/SearchField';
import SaveTag from './SaveTag';
import TeamTagsActions from './TeamTagsActions';
import TimeBefore from '../../TimeBefore';
import SettingsHeader from '../SettingsHeader';
import Can from '../../Can';
import settingsStyles from '../Settings.module.css';

const useStyles = makeStyles({
  teamTagsCardComponent: {
    padding: 0,
    paddingBottom: '0 !important',
  },
  teamTagsTableCell: {
    borderBottom: 0,
  },
  teamTagsNewTagButton: {
    whiteSpace: 'nowrap',
  },
});

const TeamTagsComponent = ({
  teamId,
  teamDbid,
  permissions,
  rules,
  rulesSchema,
  tags,
}) => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
  const classes = useStyles();
  const [sortParam, setSortParam] = React.useState('text');
  const [sortDirection, setSortDirection] = React.useState('asc');
  const [showCreateTag, setShowCreateTag] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const toggleSort = (param) => {
    setSortParam(param);
    if (sortParam === param) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortDirection('asc');
    }
  };

  const handleSearchFieldClear = () => {
    setSearchTerm('');
  };

  const sortFunc = (a, b) => (a[sortParam] > b[sortParam] ? 1 : -1) * (sortDirection === 'asc' ? 1 : -1);

  const sortedTags = tags.slice().filter(t => t.text.toLowerCase().includes(searchTerm.toLowerCase())).sort(sortFunc);

  return (
    <>
      <SettingsHeader
        title={
          <FormattedMessage
            id="teamTagsComponent.title"
            defaultMessage="Tags [{count}]"
            description="Title for the tags settings page"
            values={{ count: tags.length }}
          />
        }
        helpUrl="https://help.checkmedia.org/en/articles/6542134-tags"
        actionButton={
          <Can permissions={permissions} permission="create TagText">
            <ButtonMain
              variant="contained"
              theme="brand"
              size="default"
              onClick={() => { setShowCreateTag(true); }}
              className={classes.teamTagsNewTagButton}
              label={
                <FormattedMessage
                  id="teamTagsComponent.newTag"
                  defaultMessage="New tag"
                  description="Button label for calling the new tag creation modal"
                />
              }
              buttonProps={{
                id: 'team-tags__create',
              }}
            />
          </Can>
        }
        extra={
          <SearchField
            inputBaseProps={{
              onChange: (e) => { setSearchTerm(e.target.value); },
            }}
            handleClear={handleSearchFieldClear}
          />
        }
      />
      <div className={cx(settingsStyles['setting-details-wrapper'])}>
        <Card>
          <CardContent className={classes.teamTagsCardComponent}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <FormattedMessage
                        id="teamTagsComponent.tableHeaderName"
                        defaultMessage="Name"
                        description="Column header in tags table."
                      >
                        { text => (
                          <TableSortLabel
                            active={sortParam === 'text'}
                            direction={sortDirection || undefined}
                            onClick={() => toggleSort('text')}
                            IconComponent={KeyboardArrowDownIcon}
                          >
                            {text}
                          </TableSortLabel>
                        )}
                      </FormattedMessage>
                    </TableCell>
                    <TableCell>
                      <FormattedMessage
                        id="teamTagsComponent.tableHeaderUpdatedAt"
                        defaultMessage="Updated"
                        description="Column header in tags table."
                      >
                        { text => (
                          <TableSortLabel
                            active={sortParam === 'updated_at'}
                            direction={sortDirection || undefined}
                            onClick={() => toggleSort('updated_at')}
                            IconComponent={KeyboardArrowDownIcon}
                          >
                            {text}
                          </TableSortLabel>
                        )}
                      </FormattedMessage>
                    </TableCell>
                    <TableCell>
                      <FormattedMessage
                        id="teamTagsComponent.tableHeaderTagsCount"
                        defaultMessage="Items"
                        description="Column header in tags table."
                      >
                        { text => (
                          <TableSortLabel
                            active={sortParam === 'tags_count'}
                            direction={sortDirection || undefined}
                            onClick={() => toggleSort('tags_count')}
                            IconComponent={KeyboardArrowDownIcon}
                          >
                            {text}
                          </TableSortLabel>
                        )}
                      </FormattedMessage>
                    </TableCell>
                    <TableCell padding="checkbox" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  { sortedTags.map(tag => (
                    <TableRow key={tag.id} className="team-tags__row">
                      <TableCell className={classes.teamTagsTableCell}>
                        {tag.text}
                      </TableCell>
                      <TableCell className={classes.teamTagsTableCell}>
                        <TimeBefore date={tag.updated_at} />
                      </TableCell>
                      <TableCell className={classes.teamTagsTableCell}>
                        <a href={`/${teamSlug}/all-items/%7B"tags"%3A%5B"${tag.text}"%5D%7D`} target="_blank" rel="noopener noreferrer">
                          {tag.tags_count}
                        </a>
                      </TableCell>
                      <TableCell className={classes.teamTagsTableCell}>
                        <Can permissions={permissions} permission="create TagText">
                          <TeamTagsActions
                            tag={tag}
                            teamId={teamId}
                            teamDbid={teamDbid}
                            rules={rules}
                            rulesSchema={rulesSchema}
                          />
                        </Can>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </div>
      { showCreateTag ?
        <SaveTag
          tag={null}
          teamId={teamId}
          teamDbid={teamDbid}
          rules={rules}
          rulesSchema={rulesSchema}
          onCancel={() => { setShowCreateTag(false); }}
        /> : null }
    </>
  );
};

TeamTagsComponent.defaultProps = {
  rules: [],
};

TeamTagsComponent.propTypes = {
  teamId: PropTypes.string.isRequired,
  teamDbid: PropTypes.number.isRequired,
  permissions: PropTypes.string.isRequired,
  rulesSchema: PropTypes.object.isRequired,
  rules: PropTypes.arrayOf(PropTypes.object),
  tags: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    tags_count: PropTypes.number.isRequired,
    updated_at: PropTypes.object.isRequired, // Date object
  }).isRequired).isRequired,
};

export default TeamTagsComponent;
