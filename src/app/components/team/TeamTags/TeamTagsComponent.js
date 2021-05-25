import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TextField from '@material-ui/core/TextField';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import SearchIcon from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';
import SaveTag from './SaveTag';
import TeamTagsActions from './TeamTagsActions';
import TimeBefore from '../../TimeBefore';
import SettingsHeader from '../SettingsHeader';
import { ContentColumn } from '../../../styles/js/shared';
import Can from '../../Can';

const useStyles = makeStyles(theme => ({
  teamTagsCardComponent: {
    padding: 0,
    paddingBottom: '0 !important',
  },
  teamTagsTableCell: {
    borderBottom: 0,
  },
  teamTagsSearchField: {
    background: 'white',
    padding: 0,
    margin: `0 ${theme.spacing(28)}px`,
  },
}));

const TeamTagsComponent = ({
  teamId,
  teamDbid,
  permissions,
  rules,
  rulesSchema,
  tags,
}) => {
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

  const sortFunc = (a, b) => (a[sortParam] > b[sortParam] ? 1 : -1) * (sortDirection === 'asc' ? 1 : -1);

  const sortedTags = tags.slice().filter(t => t.text.toLowerCase().includes(searchTerm.toLowerCase())).sort(sortFunc);

  return (
    <ContentColumn large>
      <SettingsHeader
        title={
          <FormattedMessage
            id="teamTagsComponent.title"
            defaultMessage="Tags"
            description="Title for the tags settings page"
          />
        }
        subtitle={
          <Box>{sortedTags.length} / {tags.length}</Box>
        }
        helpUrl="https://help.checkmedia.org/en/articles/3648432-workflow-settings#default-tag-settings"
        actionButton={
          <Can permissions={permissions} permission="create TagText">
            <Button variant="contained" color="primary" onClick={() => { setShowCreateTag(true); }} id="team-tags__create">
              <FormattedMessage
                id="teamTagsComponent.newTag"
                defaultMessage="New tag"
              />
            </Button>
          </Can>
        }
        extra={
          <TextField
            label={<FormattedMessage id="teamTagsComponent.search" defaultMessage="Search" />}
            onChange={(e) => { setSearchTerm(e.target.value); }}
            variant="outlined"
            margin="normal"
            size="small"
            className={classes.teamTagsSearchField}
            InputProps={{
              startAdornment: (
                <InputAdornment>
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        }
      />
      <Card>
        <CardContent className={classes.teamTagsCardComponent}>
          <TableContainer>
            <Table>
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
                      {tag.tags_count}
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
      { showCreateTag ?
        <SaveTag
          tag={null}
          teamId={teamId}
          teamDbid={teamDbid}
          rules={rules}
          rulesSchema={rulesSchema}
          onCancel={() => { setShowCreateTag(false); }}
        /> : null }
    </ContentColumn>
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
