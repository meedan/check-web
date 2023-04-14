import React from 'react';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Select from '../cds/inputs/Select';
import LimitedTextField from '../layout/inputs/LimitedTextField';
import LimitedTextArea from '../layout/inputs/LimitedTextArea';
import styles from './NewsletterComponent.module.css';
import UploadFile from '../UploadFile';

const NewsletterComponent = () => {
  const [overlayText, setOverlayText] = React.useState('');
  const [introductionText, setIntroductionText] = React.useState('');
  const [footerText, setFooterText] = React.useState('');
  const [articleNum, setArticleNum] = React.useState(0);
  const [articles, setArticles] = React.useState(['', '', '']);

  const handleArticleNumChange = (e, newValue) => {
    setArticleNum(newValue);
  };

  // const handleArticleUpdate = (newValue, index) => {
  //   const articlesCopy = articles;
  //   articlesCopy[index] = newValue;
  //   setArticles(articlesCopy);
  // };

  const handleArticleUpdate = (newValue, index) => {
    setArticles(prev => prev.map((el, i) => (i !== index ? el : newValue)));
  };

  // eslint-disable-next-line
  console.log('~~~',)
  return (
    <div className={styles.container}>
      <div className={styles.settings}>
        <div className="typography-subtitle2">
          Content
        </div>
        <Select label="Header" className={styles.select}>
          <option value="image">Image</option>
          <option value="none">None</option>
        </Select>
        <UploadFile
          type="image+video+audio"
        />
        <LimitedTextField maxChars={160} value={overlayText} setValue={setOverlayText} />
        <LimitedTextArea maxChars={180} value={introductionText} setValue={setIntroductionText} />
        <div className={styles['newsletter-body']}>
          <div>(RSS Switch goes here)</div>
          <div className={`typography-body2 ${styles['text-secondary']}`}>
            Use an RSS feed to automatically load new content and send your newsletter on a recurring schedule. The newsletter will only be sent if new content is retrieved from the RSS.
          </div>
          <ToggleButtonGroup value={articleNum} onChange={handleArticleNumChange} exclusive>
            <ToggleButton value={0}>
              0
            </ToggleButton>
            <ToggleButton value={1}>
              1
            </ToggleButton>
            <ToggleButton value={2}>
              2
            </ToggleButton>
            <ToggleButton value={3}>
              3
            </ToggleButton>
          </ToggleButtonGroup>
          {[...Array(articleNum)].map((x, i) => (
            <LimitedTextArea key={x} maxChars={230} value={articles[i]} onChange={e => handleArticleUpdate(e.target.value, i)} />
          ))}
        </div>
        <LimitedTextField maxChars={60} value={footerText} setValue={setFooterText} />
      </div>
    </div>
  );
};

export default NewsletterComponent;
