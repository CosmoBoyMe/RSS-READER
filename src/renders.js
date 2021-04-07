import i18next from 'i18next';

const renderError = (errorMessage) => {
  const feedbackElement = document.querySelector('.feedback');
  const input = document.querySelector('input');
  input.classList.add('is-invalid');
  feedbackElement.classList.add('text-danger');
  feedbackElement.classList.remove('text-success');
  feedbackElement.textContent = errorMessage;
};

const renderHeaderAfterLoad = (domElements) => {
  const { feedback, input, button } = domElements;
  input.value = '';
  input.focus();
  input.classList.remove('is-invalid');
  feedback.classList.add('text-success');
  feedback.classList.remove('text-danger');
  feedback.textContent = i18next.t('feedback');
  button.removeAttribute('disabled');
  input.removeAttribute('readonly');
};

const renderFeed = (feed, domElements) => {
  const { title, description, id } = feed;
  if (id < 2) {
    const h2 = document.createElement('h2');
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'mb-5');
    h2.textContent = 'Фиды';
    domElements.feeds.append(h2, ul);
  }
  const ul = document.querySelector('.feeds>ul');
  const li = document.createElement('li');
  const h3 = document.createElement('h3');
  const p = document.createElement('p');
  li.classList.add('list-group-item');
  h3.textContent = title;
  p.textContent = description;
  li.append(h3, p);
  ul.prepend(li);
};

const createButton = (postId, postTitle, postDescription, postLink, openedPosts) => {
  const button = document.createElement('button');
  button.classList.add('btn', 'btn-primary');
  button.textContent = i18next.t('button');
  button.setAttribute('type', 'button');
  button.setAttribute('id', postId);
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#modal');
  button.addEventListener('click', (event) => {
    const modalTitle = document.querySelector('.modal-title');
    const modalBody = document.querySelector('.modal-body');
    const openLinkBtn = document.querySelector('.full-article');
    openLinkBtn.href = postLink;
    modalTitle.textContent = postTitle;
    modalBody.textContent = postDescription;
    openedPosts.push({ id: postId });
    const postLinkElement = event.target.previousElementSibling;
    postLinkElement.classList.remove('font-weight-bold');
    postLinkElement.classList.add('font-weight-normal');
  });

  return button;
};

const isLinkOpened = (postId, openedPosts) => !!openedPosts.find((item) => postId === item.id);

const createLink = (id, title, link, openedPosts) => {
  const a = document.createElement('a');
  a.setAttribute('href', link);
  a.setAttribute('target', 'blank');
  a.textContent = title;
  if (isLinkOpened(id, openedPosts)) {
    a.classList.remove('font-weight-bold');
    a.classList.add('font-weight-normal');
  } else {
    a.classList.add('font-weight-bold');
  }
  return a;
};
// как передовать state
const renderPosts = (posts, uiState, domElements) => {
  const postsContainer = domElements.posts;
  postsContainer.innerHTML = '';
  const h2 = document.createElement('h2');
  h2.textContent = 'Посты';

  const ul = document.createElement('ul');
  ul.classList.add('list-group');
  const { openedPosts } = uiState;
  posts.forEach((post) => {
    const {
      id, title, description, link,
    } = post;
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

    const a = createLink(id, title, link, openedPosts);
    const button = createButton(id, title, description, link, openedPosts);
    li.append(a, button);
    ul.prepend(li);
  });
  postsContainer.append(h2, ul);
};

export {
  renderError,
  renderFeed,
  renderPosts,
  renderHeaderAfterLoad,
};
