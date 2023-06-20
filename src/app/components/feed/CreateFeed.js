import React from 'react';
import { FormattedMessage, FormattedHTMLMessage } from 'react-intl';
import Checkbox from '@material-ui/core/Checkbox';
import ListIcon from '@material-ui/icons/List';
import styles from './CreateFeed.module.css';
import ExternalLink from '../ExternalLink';
import Select from '../cds/inputs/Select';
import SwitchComponent from '../cds/inputs/SwitchComponent';
import TextArea from '../cds/inputs/TextArea';
import TextField from '../cds/inputs/TextField';
import SchoolIcon from '../../icons/school.svg';
import CorporateFareIcon from '../../icons/corporate_fare.svg';
import OpenSourceIcon from '../../icons/open_source.svg';

/*
  TODO
  - Review with Brian
    - License icons
    - Verify proper casing
      - Review copy? (license ... can do with your code)
    - Borderless cards
    - Shared feed overline title
*/

const LicenseOption = ({
  icon,
  title,
  description,
  url,
}) => (
  <div className={styles.licenseOption}>
    <Checkbox />
    <div className={styles.licenseOptionIcon}>
      {icon}
    </div>
    <div>
      <div className="typography-subtitle2">
        {title}
      </div>
      {description}
      {url && (
        <>
          <span> </span> { /* white space before license link */}
          <ExternalLink url={url}>
            <FormattedMessage id="createFeed.learnMore" defaultMessage="License details" description="Link to external page with license details" />
          </ExternalLink>
        </>
      )}
    </div>
  </div>
);

const CreateFeed = () => (
  <div className={styles.createFeedContainer}>
    <div>
      <div className="typography-overline">
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
            required
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
            placeholder={placeholder}
            label={<FormattedMessage
              id="createFeed.descriptionLabel"
              defaultMessage="Description"
              description="Label for a field where the user inputs text for a description to a shared feed"
            />}
          />
        )}
      </FormattedMessage>
    </div>
    <div className={styles.createFeedCard}>
      <div className="typography-subtitle2">
        <FormattedMessage
          id="createFeed.feedContentTitle"
          defaultMessage="Feed content"
          description="Title of section where a list can be selected as the content of the feed"
        />
      </div>
      <FormattedMessage
        id="createFeed.feedContentBlurb"
        defaultMessage="Select a filtered list of fact-checks from your workspace to contribute to this shared feed. You will be able to update this list at any time."
        description="Helper text for the feed content section"
      />
      <FormattedHTMLMessage
        id="createFeed.feedContentBlurb2"
        defaultMessage="<strong>Note:</strong> Your list must contain <strong>published fact-checks</strong> in order to be part of this shared feed."
        description="Helper text for the feed content section"
      />
      <Select
        label={<FormattedMessage id="createFeed.select" defaultMessage="Select list…" description="Label for shared feed list selector" />}
        className={styles.select}
        iconLeft={<ListIcon />}
        helpContent={<FormattedMessage id="createFeed.selectHelper" defaultMessage="Fact-check title, summary,  and URL will be shared with the feed. Learn more" description="Helper text for shared feed list selector" />}
      >
        <option value="bli">bla</option>
      </Select>
    </div>
    <div className={styles.createFeedCard}>
      <div className="typography-subtitle2">
        <FormattedMessage
          id="createFeed.publishTitle"
          defaultMessage="Publish"
          description="Title of the section where the publishing preferences are set"
        />
      </div>
      <FormattedMessage
        id="createFeed.publishBlurb"
        defaultMessage="Make this shared feed discoverable by publishing it to the Marketplace. Learn more about the marketplace."
        description="Helper text for the publish feed section"
      />
      <SwitchComponent
        label={
          <FormattedMessage
            id="createFeed.publishSwitch"
            defaultMessage="Publish shared feed to Marketplace"
            description="Label for a switch where the user publishes a feed"
          />
        }
        checked
        onChange={() => {}}
      />
      <div className="typography-subtitle2">
        <FormattedMessage
          id="createFeed.licenseTitle"
          defaultMessage="License"
          description="Title of the section where the publishing preferences such as licenses are selected"
        />
      </div>
      <FormattedMessage
        id="createFeed.licenseBlurb"
        defaultMessage="A license tells others what they can and can't do with your code. Learn more about licenses."
        description="Helper text for the license section"
      />
      <LicenseOption
        icon={<SchoolIcon />}
        title={<FormattedMessage
          id="createFeed.licenseAcademic"
          defaultMessage="Academic"
          description="Label for the academic licensing of shared feed data"
        />}
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
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur mollis ultrices lorem sit amet rhoncus."
        url="http://www.meedan.com"
      />
    </div>
  </div>
);

export default CreateFeed;
