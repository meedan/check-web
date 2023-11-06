import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { createFragmentContainer, graphql, commitMutation } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage, FormattedHTMLMessage, FormattedDate } from 'react-intl';
import Checkbox from '@material-ui/core/Checkbox';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import styles from './SaveFeed.module.css';
import SelectListQueryRenderer from './SelectList';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ExternalLink from '../ExternalLink';
import { FlashMessageSetterContext } from '../FlashMessage';
import TimeBefore from '../TimeBefore';
import ConfirmProceedDialog from '../layout/ConfirmProceedDialog';
import Can from '../Can';
import BulletSeparator from '../layout/BulletSeparator';
import { getErrorMessageForRelayModernProblem, parseStringUnixTimestamp } from '../../helpers';
import Alert from '../cds/alerts-and-prompts/Alert';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import TextArea from '../cds/inputs/TextArea';
import TextField from '../cds/inputs/TextField';
import TagList from '../cds/menus-lists-dialogs/TagList';
import SchoolIcon from '../../icons/school.svg';
import CorporateFareIcon from '../../icons/corporate_fare.svg';
import OpenSourceIcon from '../../icons/open_source.svg';
import RssFeedIcon from '../../icons/rss_feed.svg';
import ChevronDownIcon from '../../icons/chevron_down.svg';

const LicenseOption = ({
  icon,
  title,
  description,
  url,
  checked,
  onChange,
}) => (
  <div className={styles.licenseOption}>
    <Checkbox checked={checked} onChange={onChange} />
    <div className={`${styles.licenseOptionIcon} ${checked ? null : styles.licenseOptionDisabled}`}>
      {icon}
    </div>
    <div>
      <div className={`typography-subtitle2 ${checked ? null : styles.licenseOptionDisabled}`}>
        {title}
      </div>
      <span className={`typography-body2 ${checked ? styles.licenseOptionDescription : styles.licenseOptionDisabled}`}>
        {description}
        {url && (
          <>
            &nbsp;
            <ExternalLink url={url}>
              <FormattedMessage id="saveFeed.licenseDetails" defaultMessage="License details" description="Link to external page with license details" />
            </ExternalLink>
          </>
        )}
      </span>
    </div>
  </div>
);

const createMutation = graphql`
  mutation SaveFeedCreateFeedMutation($input: CreateFeedInput!) {
    createFeed(input: $input) {
      feed {
        dbid
      }
      team {
        feeds(first: 10000) {
          edges {
            node {
              id
              dbid
              name
              team_id
              type: __typename
            }
          }
        }
      }
    }
  }
`;

const updateMutation = graphql`
  mutation SaveFeedUpdateFeedMutation($input: UpdateFeedInput!) {
    updateFeed(input: $input) {
      feed {
        dbid
      }
      team {
        feeds(first: 10000) {
          edges {
            node {
              name
            }
          }
        }
      }
    }
  }
`;

const destroyMutation = graphql`
  mutation SaveFeedDestroyFeedMutation($input: DestroyFeedInput!) {
    destroyFeed(input: $input) {
      deletedId
      team {
        feeds(first: 10000) {
          edges {
            node {
              id
              dbid
              name
              team_id
              type: __typename
            }
          }
        }
      }
    }
  }
`;

const SaveFeed = (props) => {
  const feed = props.feed || {}; // Editing a feed or creating a new feed
  const [title, setTitle] = React.useState(feed.name || '');
  const [description, setDescription] = React.useState(feed.description || '');
  const [selectedListId, setSelectedListId] = React.useState(feed.saved_search_id);
  const [discoverable, setDiscoverable] = React.useState(Boolean(feed.discoverable));
  const [showConfirmationDialog, setShowConfirmationDialog] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const feedLicenses = feed.licenses || [];
  const [academicLicense, setAcademicLicense] = React.useState(feedLicenses.includes(1));
  const [commercialLicense, setCommercialLicense] = React.useState(feedLicenses.includes(2));
  const [openSourceLicense, setOpenSourceLicense] = React.useState(feedLicenses.includes(3));
  const [tags, setTags] = React.useState(feed.tags || []);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const handleViewFeed = (feedId) => {
    const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
    browserHistory.push(`/${teamSlug}/feed/${feedId}/feed`);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setShowDeleteDialog(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const onSuccess = (response) => {
    const dbid = response?.createFeed?.feed?.dbid || feed.dbid;
    handleViewFeed(dbid);
    setSaving(false);
  };

  const onFailure = (error) => {
    const message = getErrorMessageForRelayModernProblem(error, <GenericUnknownErrorMessage />);
    setFlashMessage(message, 'error');
    setSaving(false);
  };

  // Error states that cause the save/edit button to disable
  const discoverableNoLicense = discoverable && (
    !academicLicense &&
    !commercialLicense &&
    !openSourceLicense
  );
  const noTitle = title.length === 0;
  const disableSaveButton = saving || discoverableNoLicense || noTitle;

  const handleSave = () => {
    setSaving(true);
    const licenses = [];
    if (academicLicense) licenses.push(1);
    if (commercialLicense) licenses.push(2);
    if (openSourceLicense) licenses.push(3);
    const input = {
      name: title,
      description,
      saved_search_id: selectedListId,
      tags,
      licenses,
      discoverable,
      published: true,
    };
    if (feed.id) {
      setShowConfirmationDialog(false);
      input.id = feed.id;
      delete input.licenses;
    }
    commitMutation(Relay.Store, {
      mutation: (feed.id ? updateMutation : createMutation),
      variables: { input },
      onCompleted: onSuccess,
      onError: onFailure,
    });
  };

  const handleConfirmOrSave = () => {
    if (feed.id) {
      setShowConfirmationDialog(true);
    } else {
      handleSave();
    }
  };

  const handleDelete = () => {
    setSaving(true);

    const input = { id: feed.id };
    commitMutation(
      Relay.Store,
      {
        mutation: destroyMutation,
        variables: { input },
        onCompleted: () => {
          const retPath = `/${feed.team.slug}/all-items`;
          browserHistory.push(retPath);
        },
        onError: onFailure,
      },
    );
  };

  return (
    <div className={styles.saveFeedContainer}>
      <div className={styles.saveFeedContent}>
        { feed.id ?
          <div>
            <ButtonMain
              variant="outlined"
              size="default"
              theme="brand"
              onClick={() => { handleViewFeed(feed.dbid); }}
              label={
                <FormattedMessage
                  id="saveFeed.viewSharedFeed"
                  defaultMessage="View Shared Feed"
                  description="Label of a button displayed on the edit feed page that when clicked takes the user to the shared feed page."
                />
              }
            />
          </div> : null }
        <div>
          <div className={`typography-caption ${styles.sharedFeedTitle}`}>
            <FormattedMessage
              id="saveFeed.sharedFeedPageTitle"
              defaultMessage="Shared feed"
              description="Title of the shared feed creation page"
            />
          </div>
          <div className="typography-h6">
            <FormattedMessage
              id="saveFeed.sharedFeedPageSubtitle"
              defaultMessage="Create a new shared feed"
              description="Subtitle of the shared feed creation page"
            />
          </div>
          <div className="typography-body1">
            <FormattedMessage
              id="createFeed.sharedFeedPageDescription"
              defaultMessage="Share data feeds with other organizations to unlock new insights across audiences and languages."
              description="Description of the shared feed creation page"
            />
          </div>
        </div>
        <div className={styles.saveFeedCard}>
          <div className="typography-subtitle2">
            <FormattedMessage
              id="saveFeed.feedDetailsTitle"
              defaultMessage="Feed details"
              description="Title of section where the details of the feed are filled. e.g.: title, description"
            />
          </div>
          <FormattedMessage
            id="saveFeed.titlePlaceholder"
            defaultMessage="Memorable feed title"
            description="Placeholder text for feed title field"
          >
            { placeholder => (
              <TextField
                id="create-feed__title"
                placeholder={placeholder}
                label={<FormattedMessage
                  id="saveFeed.titleLabel"
                  defaultMessage="Title"
                  description="Label for the shared feed title input"
                />}
                helpContent={<FormattedMessage
                  id="saveFeed.titleHelper"
                  defaultMessage="Great shared feed names are short, memorable, and tell your audience the focus of the media"
                  description="Title input helper text"
                />}
                error={noTitle}
                suppressInitialError
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            )}
          </FormattedMessage>
          <FormattedMessage
            id="saveFeed.descriptionPlaceholder"
            defaultMessage="Give this shared feed an optional description."
            description="Placeholder text for feed description field"
          >
            { placeholder => (
              <TextArea
                id="create-feed__description"
                placeholder={placeholder}
                label={<FormattedMessage
                  id="saveFeed.descriptionLabel"
                  defaultMessage="Description"
                  description="Label for a field where the user inputs text for a description to a shared feed"
                />}
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            )}
          </FormattedMessage>
          <TagList
            tags={tags}
            setTags={setTags}
          />
        </div>
        <div className={styles.saveFeedCard}>
          <div className="typography-subtitle2">
            <FormattedMessage
              id="saveFeed.feedContentTitle"
              defaultMessage="Feed content"
              description="Title of section where a list can be selected as the content of the feed"
            />
          </div>
          <div className="typography-body2">
            <FormattedMessage
              id="saveFeed.feedContentBlurb"
              defaultMessage="Select a filtered list of fact-checks from your workspace to contribute to this shared feed. You will be able to update this list at any time."
              description="Helper text for the feed content section"
            />
          </div>
          <div className="typography-body2">
            <FormattedHTMLMessage
              id="saveFeed.feedContentBlurb2"
              defaultMessage="<strong>Note:</strong> Your list must contain <strong>published fact-checks</strong> in order to be part of this shared feed."
              description="Helper text for the feed content section"
            />
          </div>
          <SelectListQueryRenderer
            required={Boolean(feed.id)}
            value={selectedListId}
            onChange={e => setSelectedListId(+e.target.value)}
            onRemove={() => setSelectedListId(null)}
            helperText={(
              <span>
                <FormattedMessage id="saveFeed.selectHelper" defaultMessage="Fact-check title, summary, and URL will be shared with the feed." description="Helper text for shared feed list selector" />
                &nbsp;
                <ExternalLink url="https://www.meedan.com">{ /* FIXME update url */}
                  <FormattedMessage id="saveFeed.learnMore" defaultMessage="Learn more." description="Link to external page with more details about shared feeds" />
                </ExternalLink>
              </span>
            )}
          />
        </div>
        <div className={styles.saveFeedCard}>
          <div className="typography-subtitle2">
            <FormattedHTMLMessage
              id="saveFeed.publishTitle"
              defaultMessage="Publish to Marketplace <small>(coming soon)</small>"
              description="Title of the section where the publishing preferences are set"
            />
          </div>
          <span className="typography-body2">
            <FormattedMessage
              id="saveFeed.publishBlurb"
              defaultMessage="Publish your feed to the marketplace to make it discoverable to third-party organizations, while keeping precise control over your assets."
              description="Helper text for the publish feed section"
            />
          </span>
          <SwitchComponent
            label={
              <FormattedMessage
                id="saveFeed.publishSwitch"
                defaultMessage="Publish shared feed to Marketplace"
                description="Label for a switch where the user publishes a feed"
              />
            }
            checked={discoverable}
            onChange={() => setDiscoverable(!discoverable)}
            disabled
          />
          { discoverable ?
            <div className={styles.licenseSection}>
              <div className="typography-subtitle2">
                <FormattedMessage
                  id="saveFeed.licenseTitle"
                  defaultMessage="License"
                  description="Title of the section where the publishing preferences such as licenses are selected"
                />
              </div>
              {
                discoverableNoLicense && (
                  <Alert
                    id="save-feed__no-license-error"
                    title={
                      <FormattedMessage
                        id="saveFeed.selectLicense"
                        defaultMessage="Select a license in order to create and publish this shared feed."
                        description="Error message that appears when a user has tried to submit a form without a legal (copyright) license chosen for their data."
                      />
                    }
                    content={
                      <ExternalLink
                        url="https://www.meedan.com" /* FIXME: Update url */
                        style={{ color: 'var(--errorSecondary)' }}
                      >
                        <FormattedMessage
                          id="saveFeed.learnMoreLicenses"
                          defaultMessage="Learn more about licenses."
                          description="Link to an external page with more information about the data licenses"
                        />
                      </ExternalLink>
                    }
                    variant="error"
                  />
                )
              }
              <span className="typography-body2">
                <FormattedMessage
                  id="saveFeed.licenseBlurb"
                  defaultMessage="A license tells others what they can and can't do with your code."
                  description="Helper text for the license section"
                />
                &nbsp;
                <ExternalLink url="https://www.meedan.com">{ /* FIXME: Update url */}
                  <FormattedMessage
                    id="saveFeed.learnMoreLicenses"
                    defaultMessage="Learn more about licenses."
                    description="Link to an external page with more information about the data licenses"
                  />
                </ExternalLink>
              </span>
              <LicenseOption
                icon={<SchoolIcon />}
                title={<FormattedMessage
                  id="saveFeed.licenseAcademic"
                  defaultMessage="Academic"
                  description="Label for the academic licensing of shared feed data"
                />}
                checked={academicLicense}
                onChange={() => setAcademicLicense(!academicLicense)}
                description="Permit the exploration of the data for noncommercial research intended for publication in an academic or other scholarly setting."
              />
              <LicenseOption
                icon={<CorporateFareIcon />}
                title={<FormattedMessage
                  id="saveFeed.licenseCommercial"
                  defaultMessage="Commercial"
                  description="Label for the academic licensing of shared feed data"
                />}
                checked={commercialLicense}
                onChange={() => setCommercialLicense(!commercialLicense)}
                description="Permit the use of the data for internal 3rd party business operations, internal research, and development efforts. "
              />
              <LicenseOption
                icon={<OpenSourceIcon />}
                title={<FormattedMessage
                  id="saveFeed.licenseOpenSource"
                  defaultMessage="Open source"
                  description="Label for the academic licensing of shared feed data"
                />}
                checked={openSourceLicense}
                onChange={() => setOpenSourceLicense(!openSourceLicense)}
                description="Permits free use and distribution of the data. Enables collaboration and adaptation for various purposes, including commercial uses."
              />
            </div>
            : null }
        </div>
      </div>
      <div className={styles.saveFeedContentNarrow}>
        <div className={styles.saveFeedButtonContainer}>
          <ButtonMain
            theme="brand"
            size="default"
            variant="contained"
            onClick={handleConfirmOrSave}
            disabled={disableSaveButton}
            label={feed.id ?
              <FormattedMessage
                id="saveFeed.updateSaveButton"
                defaultMessage="Save"
                description="Label to the save button of the shared feed update form"
              /> :
              <FormattedMessage
                id="saveFeed.createSaveButton"
                defaultMessage="Create shared feed"
                description="Label to the save button of the shared feed creation form"
              />
            }
          />
          { feed.id ?
            <Can permissions={feed.permissions} permission="destroy Feed">
              <ButtonMain
                className="typography-button ${styles.saveFeedButtonMoreActions"
                theme="text"
                size="default"
                variant="outlined"
                onClick={e => setAnchorEl(e.currentTarget)}
                disabled={disableSaveButton}
                iconRight={<ChevronDownIcon />}
                label={
                  <FormattedMessage
                    id="saveFeed.MoreActionsButton"
                    defaultMessage="More Actions"
                    description="Label to the save button of the shared feed update form"
                  />
                }
              />
            </Can>
            : null }
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            { feed.teams_count > 1 ?
              <MenuItem disabled>
                <FormattedHTMLMessage
                  id="SaveFeed.deleteButtonDisabled"
                  defaultMessage="Delete shared feed <br />(Remove collaborators to <br /> delete this shared feed)"
                  description="Menu option to inform user to remove collaborators before deleting the selected shared feed"
                />
              </MenuItem>
              :
              <MenuItem onClick={handleDeleteClick}>
                <FormattedMessage
                  id="SaveFeed.deleteButton"
                  defaultMessage="Delete shared feed"
                  description="Menu option to delete the selected shared feed"
                />
              </MenuItem>

            }
          </Menu>
        </div>

        { feed.id ?
          <div className={styles.saveFeedMetadata}>
            <BulletSeparator
              compact
              details={[
                <FormattedMessage
                  id="saveFeed.createdBy"
                  defaultMessage="Created by {teamName}"
                  values={{ teamName: feed.team?.name }}
                  description="Metadata field displayed on feed edit page."
                />,
                <span>{feed.user?.email}</span>,
                <FormattedDate value={parseInt(feed.created_at, 10) * 1000} year="numeric" month="long" day="numeric" />,
              ]}
            />
            <div className={styles.saveFeedLastUpdated}>
              <RssFeedIcon />
              <FormattedMessage
                id="saveFeed.lastUpdated"
                defaultMessage="Last updated {timeAgo}"
                values={{
                  timeAgo: <TimeBefore date={parseStringUnixTimestamp(feed.updated_at)} />,
                }}
                description="On feed edit page, show the last time the feed was changed. The placeholder 'timeAgo' is something like '10 minutes ago'."
              />
            </div>
          </div>
          : null
        }
      </div>

      {/* "Delete" dialog */}
      <ConfirmProceedDialog
        open={showDeleteDialog}
        title={
          feed.saved_search_id ?
            <FormattedMessage
              id="saveFeed.deleteSharedFeedWarningTitle"
              defaultMessage="Are you sure you want to delete this shared feed?"
              description="'Delete' here is an infinitive verb"
            />
            :
            <FormattedMessage
              id="saveFeed.deleteSharedFeedTitle"
              defaultMessage="Delete Shared Feed?"
              description="'Delete' here is an infinitive verb"
            />
        }
        body={
          feed.saved_search_id ?
            <p className={styles.saveFeedDialogDivider}>
              <FormattedHTMLMessage
                id="saveFeed.deleteSharedFeedConfirmationDialogWaningBody"
                defaultMessage="This shared feed is available to all users of <strong>{orgName}</strong>. After deleting it, no user will be able to access it.<br /><br />"
                values={{
                  orgName: feed.team?.name,
                }}
                description="Confirmation dialog message when deleting a feed."
              />
              <Alert
                variant="warning"
                title={
                  <FormattedHTMLMessage
                    id="saveFeed.deleteSharedFeedWarning"
                    defaultMessage="<strong>NOTE: Your custom list and items will remain available and unaffected.</strong>"
                    description="Warning displayed on edit feed page when no list is selected."
                  />
                }
                content={
                  <ul className="bulleted-list">
                    <li>{feed.saved_search.title}</li>
                  </ul>
                }
              />
            </p>
            :
            <p className={styles.saveFeedDialogDivider}>
              <FormattedHTMLMessage
                id="saveFeed.deleteSharedFeedConfirmationDialogBody"
                defaultMessage="This shared feed is available to all users of <strong>{orgName}</strong>. After deleting it, no user will be able to access it.<br /><br />Note: Deleting this shared feed will not remove any items or list from your workspace."
                values={{
                  orgName: feed.team?.name,
                }}
                description="Confirmation dialog message when deleting a feed."
              />
            </p>
        }
        proceedLabel={
          <FormattedMessage
            id="saveFeed.deleteSharedFeedConfirmationButton"
            defaultMessage="Delete Shared Feed"
            description="'Delete' here is an infinitive verb"
          />
        }
        onProceed={handleDelete}
        isSaving={saving}
        cancelLabel={<FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />}
        onCancel={handleClose}
      />

      {/* "Update" dialog */}
      <ConfirmProceedDialog
        open={showConfirmationDialog}
        title={
          <FormattedMessage
            id="saveFeed.confirmationDialogTitle"
            defaultMessage="Are you sure you want to update this shared feed?"
            description="Confirmation dialog title when saving a feed."
          />
        }
        body={
          <FormattedMessage
            id="saveFeed.confirmationDialogBody"
            defaultMessage="Are you sure you want to update this shared feed?"
            description="Confirmation dialog message when saving a feed."
          />
        }
        proceedLabel={<FormattedMessage id="saveFeed.confirmationDialogButton" defaultMessage="Update Shared Feed" description="Button label to confirm updating a feed." />}
        onProceed={handleSave}
        onCancel={() => { setShowConfirmationDialog(false); }}
        isSaving={saving}
      />
    </div>
  );
};

SaveFeed.defaultProps = {
  feed: {},
};

SaveFeed.propTypes = {
  feed: PropTypes.shape({
    id: PropTypes.string,
    dbid: PropTypes.number,
    name: PropTypes.string,
    discoverable: PropTypes.bool,
    description: PropTypes.string,
    saved_search_id: PropTypes.number,
    licenses: PropTypes.arrayOf(PropTypes.number),
    tags: PropTypes.arrayOf(PropTypes.string),
  }),
};

// Used in unit test
// eslint-disable-next-line import/no-unused-modules
export { SaveFeed };

export default createFragmentContainer(SaveFeed, graphql`
  fragment SaveFeed_feed on Feed {
    id
    dbid
    name
    discoverable
    description
    saved_search_id
    licenses
    tags
    created_at
    updated_at
    permissions
    team {
      name
      slug
    }
    teams_count
    user {
      email
    }
    saved_search {
      title
    }
  }
`);
