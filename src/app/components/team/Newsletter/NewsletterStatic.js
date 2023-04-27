import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import NewsletterNumberOfArticles from './NewsletterNumberOfArticles';
import LimitedTextArea from '../../layout/inputs/LimitedTextArea';

const NewsletterStatic = ({
  numberOfArticles,
  onUpdateNumberOfArticles,
  articles,
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
        key="lakjsdl"
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
              maxChars={getMaxChars()}
              value={articles[i]}
              onChange={e => handleArticleUpdate(e.target.value, i)}
              placeholder={placeholder}
            />
          )}
        </FormattedMessage>
      ))}
    </div>
  );
};

NewsletterStatic.defaultProps = {
  numberOfArticles: 0,
  articles: [],
};

NewsletterStatic.propTypes = {
  numberOfArticles: PropTypes.number,
  onUpdateNumberOfArticles: PropTypes.func.isRequired,
  articles: PropTypes.arrayOf(PropTypes.string),
  onUpdateArticles: PropTypes.func.isRequired,
};

export default NewsletterStatic;
