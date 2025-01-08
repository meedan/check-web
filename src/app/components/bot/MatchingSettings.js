import React from 'react';
import { FormattedMessage } from 'react-intl';
import Slider from '@material-ui/core/Slider';
import TextField from '../cds/inputs/TextField';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import LibraryAddCheckIcon from '../../icons/library_add_check.svg';
import styles from './BotPreview.module.css';
import settingsStyles from '../team/Settings.module.css';

const valueLabelComponet = (props) => {
  const { children, open, value } = props;

  return (
    <Tooltip arrow open={open} placement="top" title={value}>
      {children}
    </Tooltip>
  );
};

const marks = [
  {
    value: 0.75,
    label: 'Lenient',
  },
  {
    value: 0.80,
    label: '',
  },
  {
    value: 0.85,
    label: '',
  },
  {
    value: 0.90,
    label: 'Strict',
  },
];

const MatchingSettings = ({
  isAdmin,
  minWordsMatching,
  onChangeMinWordsMatching,
  onChangeSimilarityTresholdMatching,
  similarityThresholdMatching,
}) => (
  <div className={styles['settings-card']}>
    <div className={styles['settings-card-header']}>
      <LibraryAddCheckIcon />
      <span>Matching</span>
    </div>
    <div className={settingsStyles['setting-content-container']}>
      <TextField
        defaultValue={minWordsMatching}
        disabled={!isAdmin}
        helpContent={
          <FormattedMessage
            defaultMessage="If message contains less than 3 words, it will not be used to match content in the tipline."
            description="Message for additional context for the use of the minimum word value"
            id="matchingSettings.minWordsHelpMessage"
          />
        }
        label={
          <FormattedMessage
            defaultMessage="Minimum words"
            description="Label for minimum matching words input"
            id="matchingSettings.minWordsLabel"
          />
        }
        required
        onChange={e => onChangeMinWordsMatching(e.target.value)}
      />
    </div>
    <div className={settingsStyles['setting-content-container']}>
      <FormattedMessage
        defaultMessage="Search Treshold"
        description="Label for the search treshold slider"
        id="matchingSettings.similarityTresholdLabel"
      />
      <div className={styles['settings-slider-wrapper']}>
        <Slider
          ValueLabelComponent={valueLabelComponet}
          defaultValue={Number(similarityThresholdMatching)}
          disabled={!isAdmin}
          marks={marks}
          max={0.9}
          min={0.75}
          step={null}
          valueLabelDisplay="on"
          valueLabelFormat={x => (<FormattedMessage
            defaultMessage="Search Treshold: {val}"
            description="Label for value on slider."
            id="matchingSettings.similarityTresholdValueLabel"
            values={{ val: x }}
          />)}
          onChange={e => onChangeSimilarityTresholdMatching(e.target.value)}
        />
      </div>
      <FormattedMessage
        defaultMessage="When searching for articles to return based on a user message, how strict should the bot be when comparing text."
        description="Additional context for the use of the value for the search threshold slider"
        id="matchingSettings.similarityThresholdHelpMessage"
        tagName="p"
      />
    </div>
  </div>
);

export default MatchingSettings;
