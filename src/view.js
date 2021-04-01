import * as _ from 'lodash';
import {
  renderError, renderFeed, renderPosts, renderHeaderAfterLoad,
} from './renders.js';

const onChange = require('on-change');

const processStateHandler = (processState, state, domElements) => {
  switch (processState) {
    case 'processed':
      domElements.button.setAttribute('disabled', true);
      domElements.input.setAttribute('readonly', true);
      break;
    case 'loaded':
      renderFeed(_.last(state.feeds));
      renderPosts(state);
      renderHeaderAfterLoad();
      domElements.button.removeAttribute('disabled');
      domElements.input.removeAttribute('readonly');
      break;
    case 'failed': {
      renderError(state.form);
      domElements.button.removeAttribute('disabled');
      domElements.input.removeAttribute('readonly');
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
