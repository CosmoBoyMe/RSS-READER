export default (stringContainingHTMLSource) => {
  const parser = new DOMParser();
  const content = parser.parseFromString(stringContainingHTMLSource, 'application/xml');

  const error = content.querySelector('parsererror');
  if (error) {
    throw new Error('invalid');
  }
  const getTitle = (doc) => doc.querySelector('title').textContent;
  const getDescription = (doc) => doc.querySelector('description').textContent;
  const posts = content.querySelectorAll(('item'));
  const channel = {
    feed: {
      title: getTitle(content),
      description: getDescription(content),
    },
    posts: [],
  };

  [...posts].reverse().forEach((item) => {
    const post = {
      title: getTitle(item),
      description: getDescription(item),
      link: item.querySelector('link').textContent,
    };
    channel.posts.push(post);
  });

  return channel;
};
