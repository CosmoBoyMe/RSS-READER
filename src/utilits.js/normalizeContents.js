import _ from 'lodash';
import normalizePosts from './normalizePosts.js';

export default (content, link) => {
  const id = _.uniqueId();
  const { title, description } = content.feed;
  const feed = {
    title, description, link, id,
  };
  const posts = normalizePosts(id, [...content.posts]);
  return { feed, posts };
};
