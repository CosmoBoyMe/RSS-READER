export default (stringContainingHTMLSource) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(stringContainingHTMLSource, 'application/xml');

  const error = dom.querySelector('parsererror');
  if (error) {
    throw new Error('formErrors.isNotRss');
  }
  const getTitle = (doc) => doc.querySelector('title');
  const getDescription = (doc) => doc.querySelector('description');
  const posts = dom.querySelectorAll(('item'));
  const channel = {
    feed: {
      title: getTitle(dom).textContent,
      description: getDescription(dom).textContent,
    },
    posts: [],
  };

  [...posts].forEach((item) => {
    const post = {
      title: getTitle(item).textContent,
      description: getDescription(item).textContent,
      link: item.querySelector('link').textContent,
    };
    channel.posts.unshift(post);
  });

  return channel;
};
