import { setInitialTab } from './MediaComponent';

describe('<MediaComponent />', () => {
  it('should have the initial tab as Articles for new items', () => {
    const projectMedia = {
      articles_count: 0,
      requests_count: 0,
      suggested_similar_items_count: 0,
    };
    const initialTab = setInitialTab(projectMedia);
    expect(initialTab).toBe('articles');
  });

  it('should have the initial tab as Articles when there is article applied but no suggestions', () => {
    const projectMedia = {
      articles_count: 1,
      requests_count: 0,
      suggested_similar_items_count: 0,
    };
    let initialTab = setInitialTab(projectMedia);
    expect(initialTab).toBe('articles');
    projectMedia.requests_count = 5;
    initialTab = setInitialTab(projectMedia);
    expect(initialTab).toBe('articles');
  });

  it('should have the initial tab as Requests for items with requests but no articles and no suggestions', () => {
    const projectMedia = {
      articles_count: 0,
      requests_count: 1,
      suggested_similar_items_count: 0,
    };
    const initialTab = setInitialTab(projectMedia);
    expect(initialTab).toBe('requests');
  });

  it('should have the initial tab as Suggestions for items with suggestions and articles', () => {
    const projectMedia = {
      articles_count: 1,
      requests_count: 1,
      suggested_similar_items_count: 1,
    };
    const initialTab = setInitialTab(projectMedia);
    expect(initialTab).toBe('suggestedMedia');
  });

  it('should have the initial tab as Suggestions for items with suggestions and no articles', () => {
    const projectMedia = {
      articles_count: 0,
      requests_count: 0,
      suggested_similar_items_count: 1,
    };
    const initialTab = setInitialTab(projectMedia);
    expect(initialTab).toBe('suggestedMedia');
  });

  it('should have the initial tab as Suggestions for items with suggestions, requests but no articles', () => {
    const projectMedia = {
      articles_count: 0,
      requests_count: 1,
      suggested_similar_items_count: 1,
    };
    const initialTab = setInitialTab(projectMedia);
    expect(initialTab).toBe('suggestedMedia');
  });

  it('should have the initial tab as Requests for a suggested item', () => {
    const projectMedia = {
      articles_count: 1,
      requests_count: 0,
      suggested_similar_items_count: 1,
      is_suggested: true,
      is_confirmed_similar_to_another_item: false,
    };
    const initialTab = setInitialTab(projectMedia);
    expect(initialTab).toBe('requests');
  });

  it('should have the initial tab as Requests for an item confirmed as similar to another item', () => {
    const projectMedia = {
      articles_count: 1,
      requests_count: 0,
      suggested_similar_items_count: 1,
      is_suggested: false,
      is_confirmed_similar_to_another_item: true,
    };
    const initialTab = setInitialTab(projectMedia);
    expect(initialTab).toBe('requests');
  });
});
