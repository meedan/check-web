import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
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
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import NextIcon from '../../../icons/chevron_right.svg';
import PrevIcon from '../../../icons/chevron_left.svg';
import SearchField from '../../search/SearchField';
import SaveTag from './SaveTag';
import TeamTagsActions from './TeamTagsActions';
import TimeBefore from '../../TimeBefore';
import SettingsHeader from '../SettingsHeader';
import MediasLoading from '../../media/MediasLoading';
import { ContentColumn } from '../../../styles/js/shared';
import Can from '../../Can';
import styles from './TeamTagsComponent.module.css';

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
  pageSize,
  totalTags,
  totalCount,
  relay,
  searchTerm,
  setSearchTerm,
}) => {
  const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
  const classes = useStyles();
  const [showCreateTag, setShowCreateTag] = React.useState(false);
  const [cursor, setCursor] = React.useState(0);
  const [isPaginationLoading, setIsPaginationLoading] = React.useState(false);

  const handleSearchFieldClear = () => {
    setSearchTerm('');
  };

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
              onBlur: (e) => { setSearchTerm(e.target.value); },
            }}
            handleClear={handleSearchFieldClear}
            searchText={searchTerm}
          />
        }
      />
      { totalTags > pageSize && // only display paginator if there are more than pageSize worth of tags overall in the database
        <div className={styles['tags-wrapper']}>
          <Tooltip title={
            <FormattedMessage id="search.previousPage" defaultMessage="Previous page" description="Pagination button to go to previous page" />
          }
          >
            <ButtonMain
              disabled={isPaginationLoading || cursor - pageSize < 0}
              variant="text"
              theme="brand"
              size="default"
              onClick={() => {
                if (cursor - pageSize >= 0) {
                  setCursor(cursor - pageSize);
                }
              }}
              iconCenter={<PrevIcon />}
            />
          </Tooltip>
          <span className={cx('typography-button', styles['tags-header-count'])}>
            <FormattedMessage
              id="searchResults.itemsCount"
              defaultMessage="{totalCount, plural, one {1 / 1} other {{from} - {to} / #}}"
              description="Pagination count of items returned"
              values={{
                from: cursor + 1,
                to: Math.min(cursor + pageSize, totalCount),
                totalCount,
              }}
            />
          </span>
          <Tooltip title={
            <FormattedMessage id="search.nextPage" defaultMessage="Next page" description="Pagination button to go to next page" />
          }
          >
            <ButtonMain
              disabled={isPaginationLoading || cursor + pageSize >= totalCount}
              variant="text"
              theme="brand"
              size="default"
              onClick={() => {
                if (relay.hasMore() && !relay.isLoading() && (cursor + pageSize >= tags.length)) {
                  setIsPaginationLoading(true);
                  relay.loadMore(pageSize, () => {
                    setCursor(cursor + pageSize);
                    setIsPaginationLoading(false);
                  });
                } else if (cursor + pageSize < tags.length) {
                  setCursor(cursor + pageSize);
                }
              }}
              iconCenter={<NextIcon />}
            />
          </Tooltip>
        </div>
      }
      <Card>
        <CardContent className={classes.teamTagsCardComponent}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell className={styles['table-col-head-name']}>
                    <FormattedMessage
                      id="teamTagsComponent.tableHeaderName"
                      defaultMessage="Name"
                      description="Column header in tags table."
                    />
                  </TableCell>
                  <TableCell className={styles['table-col-head-updated']}>
                    <FormattedMessage
                      id="teamTagsComponent.tableHeaderUpdatedAt"
                      defaultMessage="Updated"
                      description="Column header in tags table."
                    />
                  </TableCell>
                  <TableCell className={styles['table-col-head-items']}>
                    <FormattedMessage
                      id="teamTagsComponent.tableHeaderTagsCount"
                      defaultMessage="Items"
                      description="Column header in tags table."
                    />
                  </TableCell>
                  <TableCell padding="checkbox" className={styles['table-col-head-action']} />
                </TableRow>
              </TableHead>
              { isPaginationLoading && <MediasLoading size="medium" theme="grey" variant="inline" /> }
              <TableBody className={isPaginationLoading && styles['tags-hide']}>
                { tags.slice(cursor, cursor + pageSize).map(tag => (
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
