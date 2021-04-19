export default (stringContainingHTMLSource) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(stringContainingHTMLSource, 'application/xml');

  const error = dom.querySelector('parsererror');
  if (error) {
    const err = new Error('formErrors.isNotRss');
    err.isParsingError = true;
    throw err;
  }

  const getTitle = (doc) => doc.querySelector('title');
  const getDescription = (doc) => doc.querySelector('description');
  const getLink = (doc) => doc.querySelector('link');
  const postsElements = dom.querySelectorAll(('item'));

  const feedTitleElement = getTitle(dom);
  const feedDescriptionElement = getDescription(dom);

  const posts = Array.from(postsElements).reverse().map((item) => {
    const postTitleElement = getTitle(item);
    const postDescriptionElement = getDescription(item);
    const postLinkElement = getLink(item);

    const post = {
      title: postTitleElement.textContent,
      description: postDescriptionElement.textContent,
      link: postLinkElement.textContent,
    };
    return post;
  });

  return {
    feed: {
      title: feedTitleElement.textContent,
      description: feedDescriptionElement.textContent,
    },
    posts,
  };
};
