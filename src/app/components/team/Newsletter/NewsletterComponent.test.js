import React from 'react';
import { shallow } from 'enzyme';
import { NewsletterComponentTest } from './NewsletterComponent';

describe('<NewsletterComponent />', () => {
  const teamStatic = {
    defaultLanguage: 'en',
    languages: '["en", "es"]',
    permissions: '{}',
    tipline_newsletters: {
      edges: [
        {
          node: {
            language: 'en',
            number_of_articles: 2,
            introduction: 'This is an introduction',
            header_type: 'none',
            header_overlay_text: 'Some overlay',
            content_type: 'static',
            first_article: 'First article',
            second_article: 'Second article',
            third_article: '',
            rss_feed_url: null,
          },
        },
      ],
    },
  };

  const teamRss = {
    defaultLanguage: 'en',
    languages: '["en", "es"]',
    permissions: '{}',
    tipline_newsletters: {
      edges: [
        {
          node: {
            language: 'en',
            number_of_articles: 2,
            introduction: 'This is an introduction',
            header_type: 'none',
            header_overlay_text: 'Some overlay',
            content_type: 'rss',
            first_article: 'First article',
            second_article: 'Second article',
            third_article: '',
            rss_feed_url: 'https://example.com/feed.xml',
          },
        },
      ],
    },
  };

  it('renders static newsletter correctly', () => {
    const newsletter = shallow(<NewsletterComponentTest
      className="newsletter"
      language="en"
      languages={['en', 'es']}
      setFlashMessage={() => {}}
      team={teamStatic}
      onChangeLanguage={() => {}}
    />);
    expect(newsletter.find('.newsletter-component')).toHaveLength(1);
    expect(newsletter.find('NewsletterStatic')).toHaveLength(1);
    const staticItem = newsletter.find('NewsletterStatic');
    expect(staticItem.props().numberOfArticles).toEqual(2);
    // No matter what, we have three articles even if there are blanks
    expect(staticItem.props().articles.length).toEqual(3);
    // header
    const header = newsletter.find('.newsletter-component-header');
    expect(header).toHaveLength(1);
    expect(header.props().overlayText).toEqual('Some overlay');
  });

  it('renders rss newsletter correctly', () => {
    const newsletter = shallow(<NewsletterComponentTest
      className="newsletter"
      language="en"
      languages={['en', 'es']}
      setFlashMessage={() => {}}
      team={teamRss}
      onChangeLanguage={() => {}}
    />);
    expect(newsletter.find('.newsletter-component')).toHaveLength(1);
    expect(newsletter.find('NewsletterRssFeed')).toHaveLength(1);
    const rssItem = newsletter.find('NewsletterRssFeed');
    expect(rssItem.props().numberOfArticles).toEqual(2);
    // No matter what, we have three articles even if there are blanks
    expect(rssItem.props().rssFeedUrl).toEqual('https://example.com/feed.xml');
    // header
    const header = newsletter.find('.newsletter-component-header');
    expect(header).toHaveLength(1);
    expect(header.props().overlayText).toEqual('Some overlay');
  });
});
