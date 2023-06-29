import React from 'react';
import { browserHistory } from 'react-router';
import { graphql, commitMutation } from 'react-relay/compat';
import Relay from 'react-relay/classic';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import styles from './CreateFeed.module.css';
import SelectListQueryRenderer from './SelectList';
import GenericUnknownErrorMessage from '../GenericUnknownErrorMessage';
import ExternalLink from '../ExternalLink';
import { FlashMessageSetterContext } from '../FlashMessage';
import { getErrorMessageForRelayModernProblem } from '../../helpers';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import TextArea from '../cds/inputs/TextArea';
import TextField from '../cds/inputs/TextField';
import TagList from '../cds/menus-lists-dialogs/TagList';
import SchoolIcon from '../../icons/school.svg';
import CorporateFareIcon from '../../icons/corporate_fare.svg';
import OpenSourceIcon from '../../icons/open_source.svg';

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
              <FormattedMessage id="createFeed.licenseDetails" defaultMessage="License details" description="Link to external page with license details" />
            </ExternalLink>
          </>
        )}
      </span>
    </div>
  </div>
);

const submitCreateFeed = ({
  title,
  description,
  licenses,
  selectedListId,
  tags,
  onFailure,
  onSuccess,
  published,
}) => {
  commitMutation(Relay.Store, {
    mutation: graphql`
      mutation CreateFeedCreateFeedMutation($input: CreateFeedInput!) {
        createFeed(input: $input) {
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
    `,
    variables: {
      input: {
        name: title,
        description,
        saved_search_id: selectedListId,
        tags,
        licenses,
        published,
      },
    },
    onCompleted: onSuccess,
    onError: onFailure,
  });
};

const CreateFeed = () => {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [selectedListId, setSelectedListId] = React.useState(null);
  const [published, setPublished] = React.useState(true);
  const [academicLicense, setAcademicLicense] = React.useState(false);
  const [commercialLicense, setCommercialLicense] = React.useState(false);
  const [openSourceLicense, setOpenSourceLicense] = React.useState(false);
  const [tags, setTags] = React.useState([]);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const onSuccess = (response) => {
    const { dbid } = response.createFeed.feed;
    const teamSlug = window.location.pathname.match(/^\/([^/]+)/)[1];
    browserHistory.push(`/${teamSlug}/feed/${dbid}/feed`);
  };
  const onFailure = (error) => {
    const message = getErrorMessageForRelayModernProblem(error, <GenericUnknownErrorMessage />);
    setFlashMessage(message, 'error');
  };
  const handleSaveButton = () => {
    const licenses = [];
    if (academicLicense) licenses.push(1);
    if (commercialLicense) licenses.push(2);
    if (openSourceLicense) licenses.push(3);
    submitCreateFeed({
      title,
      description,
      licenses,
      selectedListId,
      tags,
      published,
      onSuccess,
      onFailure,
    });
  };

  return (
    <div className={styles.createFeedContainer}>
      <div className={styles.createFeedContent}>
        <div>
          <div className={`typography-caption ${styles.sharedFeedTitle}`}>
            <FormattedMessage
              id="createFeed.sharedFeedPageTitle"
              defaultMessage="Shared feed"
              description="Title of the shared feed creation page"
            />
          </div>
          <div className="typography-h6">
            <FormattedMessage
              id="createFeed.sharedFeedPageSubtitle"
              defaultMessage="Create a new shared feed"
              description="Subtitle of the shared feed creation page"
            />
          </div>
          <div className="typography-body1">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </div>
        </div>
        <div className={styles.createFeedCard}>
          <div className="typography-subtitle2">
            <FormattedMessage
              id="createFeed.feedDetailsTitle"
              defaultMessage="Feed details"
              description="Title of section where the details of the feed are filled. e.g.: title, description"
            />
          </div>
          <FormattedMessage
            id="createFeed.titlePlaceholder"
            defaultMessage="Memorable feed title"
            description="Placeholder text for feed title field"
          >
            { placeholder => (
              <TextField
                id="create-feed__title"
                placeholder={placeholder}
                label={<FormattedMessage
                  id="createFeed.titleLabel"
                  defaultMessage="Title"
                  description="Label for the shared feed title input"
                />}
                helpContent={<FormattedMessage
                  id="createFeed.titleHelper"
                  defaultMessage="Great shared feed names are short, memorable, and tell your audience the focus of the media"
                  description="Title input helper text"
                />}
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            )}
          </FormattedMessage>
          <FormattedMessage
            id="createFeed.descriptionPlaceholder"
            defaultMessage="Give this shared feed an optional description."
            description="Placeholder text for feed description field"
          >
            { placeholder => (
              <TextArea
                id="create-feed__description"
                placeholder={placeholder}
                label={<FormattedMessage
                  id="createFeed.descriptionLabel"
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
        <div className={styles.createFeedCard}>
          <div className="typography-subtitle2">
            <FormattedMessage
              id="createFeed.feedContentTitle"
              defaultMessage="Feed content"
              description="Title of section where a list can be selected as the content of the feed"
            />
          </div>
          <div className="typography-body2">
            <FormattedMessage
              id="createFeed.feedContentBlurb"
              defaultMessage="Select a filtered list of fact-checks from your workspace to contribute to this shared feed. You will be able to update this list at any time."
              description="Helper text for the feed content section"
            />
          </div>
          <div className="typography-body2">
            <FormattedHTMLMessage
              id="createFeed.feedContentBlurb2"
              defaultMessage="<strong>Note:</strong> Your list must contain <strong>published fact-checks</strong> in order to be part of this shared feed."
              description="Helper text for the feed content section"
            />
          </div>
          <SelectListQueryRenderer
            value={selectedListId}
            onChange={e => setSelectedListId(+e.target.value)}
            onRemove={() => setSelectedListId(null)}
            helperText={(
              <span>
                <FormattedMessage id="createFeed.selectHelper" defaultMessage="Fact-check title, summary, and URL will be shared with the feed." description="Helper text for shared feed list selector" />
                &nbsp;
                <ExternalLink url="http://www.meedan.com">{ /* FIXME update url */}
                  <FormattedMessage id="createFeed.learnMore" defaultMessage="Learn more." description="Link to external page with more details about shared feeds" />
                </ExternalLink>
              </span>
            )}
          />
        </div>
        <div className={styles.createFeedCard}>
          <div className="typography-subtitle2">
            <FormattedMessage
              id="createFeed.publishTitle"
              defaultMessage="Publish"
              description="Title of the section where the publishing preferences are set"
            />
          </div>
          <span className="typography-body2">
            <FormattedMessage
              id="createFeed.publishBlurb"
              defaultMessage="Make this shared feed discoverable by publishing it to the Marketplace."
              description="Helper text for the publish feed section"
            />
            &nbsp;
            <ExternalLink url="http://www.meedan.com">{ /* FIXME: Update url */}
              <FormattedMessage
                id="createFeed.learnMoreMarketplace"
                defaultMessage="Learn more about the marketplace."
                description="Link to and external page with more information about the marketplace"
              />
            </ExternalLink>
          </span>
          <SwitchComponent
            label={
              <FormattedMessage
                id="createFeed.publishSwitch"
                defaultMessage="Publish shared feed to Marketplace"
                description="Label for a switch where the user publishes a feed"
              />
            }
            checked={published}
            onChange={() => setPublished(!published)}
          />
          { published ?
            <div className={styles.licenseSection}>
              <div className="typography-subtitle2">
                <FormattedMessage
                  id="createFeed.licenseTitle"
                  defaultMessage="License"
                  description="Title of the section where the publishing preferences such as licenses are selected"
                />
              </div>
              <span className="typography-body2">
                <FormattedMessage
                  id="createFeed.licenseBlurb"
                  defaultMessage="A license tells others what they can and can't do with your code."
                  description="Helper text for the license section"
                />
                &nbsp;
                <ExternalLink url="http://www.meedan.com">{ /* FIXME: Update url */}
                  <FormattedMessage
                    id="createFeed.learnMoreLicenses"
                    defaultMessage="Learn more about licenses."
                    description="Link to and external page with more information about the data licenses"
                  />
                </ExternalLink>
              </span>
              <LicenseOption
                icon={<SchoolIcon />}
                title={<FormattedMessage
                  id="createFeed.licenseAcademic"
                  defaultMessage="Academic"
                  description="Label for the academic licensing of shared feed data"
                />}
                checked={academicLicense}
                onChange={() => setAcademicLicense(!academicLicense)}
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur mollis ultrices lorem sit amet rhoncus."
                url="http://www.meedan.com"
              />
              <LicenseOption
                icon={<CorporateFareIcon />}
                title={<FormattedMessage
                  id="createFeed.licenseCommercial"
                  defaultMessage="Commercial"
                  description="Label for the academic licensing of shared feed data"
                />}
                checked={commercialLicense}
                onChange={() => setCommercialLicense(!commercialLicense)}
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur mollis ultrices lorem sit amet rhoncus."
                url="http://www.meedan.com"
              />
              <LicenseOption
                icon={<OpenSourceIcon />}
                title={<FormattedMessage
                  id="createFeed.licenseOpenSource"
                  defaultMessage="Open source"
                  description="Label for the academic licensing of shared feed data"
                />}
                checked={openSourceLicense}
                onChange={() => setOpenSourceLicense(!openSourceLicense)}
                description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur mollis ultrices lorem sit amet rhoncus."
                url="http://www.meedan.com"
              />
            </div>
            : null }
        </div>
      </div>
      <div className={styles.createFeedContentNarrow}>
        <Button
          color="primary"
          variant="contained"
          onClick={handleSaveButton}
        >
          <FormattedMessage
            id="createFeed.createSaveButton"
            defaultMessage="Create shared feed"
            description="Label to the save button of the shared feed creation form"
          />
        </Button>
      </div>
    </div>
  );
};

export default CreateFeed;
