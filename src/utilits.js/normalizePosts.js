import _ from 'lodash';

export default (feedId, posts) => posts
  .map((item) => {
    const post = item;
    post.feedId = feedId;
    post.id = _.uniqueId();
    return post;
  });
