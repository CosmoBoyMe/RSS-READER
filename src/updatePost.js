import parseContents from './utilits.js/parser.js';
import getRequest from './utilits.js/getRequest.js';
import normalizePosts from './utilits.js/normalizePosts.js';

const getNewPosts = (oldPosts, allPosts) => {
  const posts = [];
  allPosts.forEach((post) => {
    const isNewPost = !oldPosts.find((p) => p.title === post.title);
    if (isNewPost) {
      posts.push(post);
    }
  });
  return posts;
};

const updatePosts = (state) => {
  const timeout = 5000;
  if (state.posts.length === 0) {
    setTimeout(() => updatePosts(state), timeout);
    return;
  }
  const watcher = state;
  const promises = watcher.feeds.map((feed) => getRequest(feed.link)
    .then((response) => {
      const contents = parseContents(response.data.contents);
      const newPosts = getNewPosts(watcher.posts, contents.posts);
      if (newPosts.length < 1) {
        return [];
      }
      const normalizeNewPosts = normalizePosts(feed.id, newPosts);
      return normalizeNewPosts;
    }));
  Promise.all(promises)
    .then((values) => {
      watcher.posts.push(...values.flat());
      watcher.appProcessState = 'updated';
      watcher.appProcessState = 'idle';
    })
    .catch((e) => console.log(e))
    .finally(() => setTimeout(() => updatePosts(state), timeout));
};

export default updatePosts;
