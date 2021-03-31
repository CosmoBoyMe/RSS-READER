import * as _ from 'lodash';
import {
  renderError, renderFeed, renderPosts, renderHeaderAfterLoad,
} from './renders.js';

const onChange = require('on-change');

const processStateHandler = (processState, state, domElements) => {
  switch (processState) {
    case 'processed':
      domElements.button.setAttribute('disabled', true);
      break;
    case 'loaded':
      renderFeed(_.last(state.feeds));
      renderPosts(state);
      renderHeaderAfterLoad();
      domElements.button.removeAttribute('disabled');
      break;
    case 'failed': {
      renderError(state.form);
      domElements.button.removeAttribute('disabled');
      break;
    }
    case 'updated':
      renderPosts(state);
      break;
    default:
      break;
  }
};

const initView = (state, domElements) => {
  const watchedState = onChange(state, (path, value) => {
    if (path === 'processState') {
      processStateHandler(value, state, domElements);
    }
  });
  return watchedState;
};
export default initView;
