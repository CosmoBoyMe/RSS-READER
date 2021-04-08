import * as _ from 'lodash';
import onChange from 'on-change';
import {
  renderError, renderFeed, renderPosts, renderHeaderAfterLoad,
} from './renders.js';

const processStateHandler = (processState, state, domElements) => {
  switch (processState) {
    case 'loading':
      domElements.button.setAttribute('disabled', true);
      domElements.input.setAttribute('readonly', true);
      break;
    case 'succeeded': {
      renderFeed(_.last(state.feeds), domElements);
      renderPosts(state.posts, state.uiState, domElements);
      renderHeaderAfterLoad(domElements);
      break;
    }
    case 'failed': {
      renderError(state.form.errorMessage);
      domElements.button.removeAttribute('disabled');
      domElements.input.removeAttribute('readonly');
      break;
    }
    case 'updated':
      renderPosts(state.posts, state.uiState, domElements);
      break;
    default:
      break;
  }
};

const watcher = (state, domElements) => {
  const watch = onChange(state, (path, value) => {
    if (path === 'appProcessState') {
      processStateHandler(value, state, domElements);
    }
  });
  return watch;
};
export default watcher;
