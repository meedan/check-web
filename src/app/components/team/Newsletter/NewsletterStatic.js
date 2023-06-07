import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import NewsletterNumberOfArticles from './NewsletterNumberOfArticles';
import LimitedTextArea from '../../layout/inputs/LimitedTextArea';

const NewsletterStatic = ({
  disabled,
  articleErrors,
  numberOfArticles,
  onUpdateNumberOfArticles,
  articles,
  setTextfieldOverLength,
  onUpdateArticles,
}) => {
  const getMaxChars = () => {
    let maxChars = 694;
    if (numberOfArticles === 2) {
      maxChars = 345;
    } else if (numberOfArticles === 3) {
      maxChars = 230;
    }
    return maxChars;
  };

  const handleArticleUpdate = (newValue, index) => {
    const newArticles = articles.slice();
    newArticles[index] = newValue;
    onUpdateArticles(newArticles);
  };

  return (
    <div className="newsletter-static">
      <NewsletterNumberOfArticles
        disabled={disabled}
        number={numberOfArticles}
        options={[0, 1, 2, 3]}
        onChangeNumber={onUpdateNumberOfArticles}
      />
      {[...Array(numberOfArticles)].map((x, i) => (
        <FormattedMessage
          id="newsletterStatic.articlePlaceholder"
          className="newsletter-article"
          defaultMessage="Add text or link"
          description="Placeholder text for a field where the user is supposed to enter text for an article, or a link to an article"
          key={`${x}fm`}
        >
          { placeholder => (
            <LimitedTextArea
              key={x}
              disabled={disabled}
              error={!!articleErrors[i]}
              onErrorTooLong={(error) => {
                setTextfieldOverLength(error);
              }}
              helpContent={articleErrors[i]}
              label="&nbsp;"
              maxChars={getMaxChars()}
              value={articles[i]}
              onChange={e => handleArticleUpdate(e.target.value, i)}
              placeholder={placeholder}
              rows={4}
            />
          )}
        </FormattedMessage>
      ))}
    </div>
  );
};

NewsletterStatic.defaultProps = {
  disabled: false,
  numberOfArticles: 0,
  articles: [],
  articleErrors: [],
};

NewsletterStatic.propTypes = {
  disabled: PropTypes.bool,
  numberOfArticles: PropTypes.number,
  onUpdateNumberOfArticles: PropTypes.func.isRequired,
  articles: PropTypes.arrayOf(PropTypes.string),
  articleErrors: PropTypes.arrayOf(PropTypes.element),
  onUpdateArticles: PropTypes.func.isRequired,
  setTextfieldOverLength: PropTypes.func.isRequired,
};

export default NewsletterStatic;
