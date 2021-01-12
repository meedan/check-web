import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import ClaimReview from './ClaimReview';

describe('<ClaimReview />', () => {
  const data = {
    '@context': 'http://schema.org',
    '@type': 'ClaimReview',
    datePublished: '2017-02-17 21:18:10 UTC',
    url: 'http://www.politifact.com/global-news/statements/2017/feb/17/bob-corker/are-27-million-people-trapped-modern-slavery/',
    author: {
      '@type': 'Organization',
      name: 'PolitiFact',
      url: 'https://www.politifact.com',
    },
    claimReviewed: '"Today, 27 million people .. are enslaved."',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '5',
      alternateName: 'Mostly True',
      worstRating: '1',
      bestRating: '7',
      image: 'https://dhpikd1t89arn.cloudfront.net/rating_images/politifact/tom-mostlytrue.jpg',
    },
    itemReviewed: {
      '@type': 'CreativeWork',
      author: {
        '@type': 'Person',
        name: 'Bob Corker',
        jobTitle: 'U.S. Senator from Tennessee',
        image: 'https://dhpikd1t89arn.cloudfront.net/rating_images/politifact/tom-mostlytrue.jpg',
        sameAs: [],
      },
      datePublished: '2017-02-15',
      name: "In an interview on MSNBC's \"Morning Joe\"",
    },
  };

  it('should render claim reviews with full data', () => {
    const claimReview = mountWithIntl(<ClaimReview data={data} />);
    expect(claimReview.text()).toMatch('Today, 27 million people .. are enslaved.');
    expect(claimReview.text()).toMatch('Bob Corker');
    expect(claimReview.text()).toMatch('Mostly True');
    expect(claimReview.text()).toMatch('PolitiFact');
  });

  it('should render claim reviews with incomplete data', () => {
    delete data.reviewRating.alternateName;
    delete data.author.name;
    const claimReview = mountWithIntl(<ClaimReview data={data} />);
    expect(claimReview.text()).toMatch('Today, 27 million people .. are enslaved.');
    expect(claimReview.text()).toMatch('Bob Corker');
    expect(claimReview.text()).toMatch('5 (1-7)');
    expect(claimReview.text()).toMatch('www.politifact.com');
  });

  it('should not crash with missing data', () => {
    delete data.claimReviewed;
    delete data.author;
    delete data.itemReviewed;
    const claimReview = mountWithIntl(<ClaimReview data={data} />);
    expect(claimReview.html()).toEqual('');
  });
});
