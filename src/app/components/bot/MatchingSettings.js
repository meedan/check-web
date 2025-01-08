import React from 'react';
import TextField from '../cds/inputs/TextField';
import LanguageIcon from '../../icons/language.svg';
import styles from './BotPreview.module.css';
import settingsStyles from '../team/Settings.module.css';

const MatchingSettings = ({
  isAdmin,
  maxWordsMatching,
  onChangeMaxWordsMatching,
  onChangeSimilarityTresholdMatching,
  similarityThresholdMatching,
}) => (
  <div className={styles['settings-card']}>
    <div className={styles['settings-card-header']}>
      <LanguageIcon />
      <span>Matching</span>
    </div>
    <div className={settingsStyles['setting-content-container']}>
      <TextField
        defaultValue={maxWordsMatching}
        disabled={!isAdmin}
        label="Max words matching"
        onChange={e => onChangeMaxWordsMatching(e.target.value)}
      />
    </div>
    <div className={settingsStyles['setting-content-container']}>
      <TextField
        defaultValue={similarityThresholdMatching}
        disabled={!isAdmin}
        label="Similarity threshold matching"
        onChange={e => onChangeSimilarityTresholdMatching(e.target.value)}
      />
    </div>
  </div>
);

export default MatchingSettings;
