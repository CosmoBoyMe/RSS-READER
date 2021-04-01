import i18next from 'i18next';

const renderError = (formState) => {
  const feedbackElement = document.querySelector('.feedback');
  const input = document.querySelector('input');
  input.classList.add('is-invalid');
  feedbackElement.classList.add('text-danger');
  feedbackElement.classList.remove('text-success');
  feedbackElement.textContent = formState.errorMessage;
};

const renderHeaderAfterLoad = () => {
  const feedbackElement = document.querySelector('.feedback');
  const input = document.querySelector('input');
  input.value = '';
  input.focus();
  input.classList.remove('is-invalid');
  feedbackElement.classList.add('text-success');
  feedbackElement.classList.remove('text-danger');
  feedbackElement.textContent = i18next.t('feedback');
};

const renderFeed = ({ id, feedTitle, feedDescription }) => {
  const container = document.querySelector('.feeds');
  if (id < 2) {
    const h2 = document.createElement('h2');
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'mb-5');
    h2.textContent = 'Фиды';
    container.append(h2, ul);
  }
  const ul = document.querySelector('.feeds>ul');
  const li = document.createElement('li');
  const h3 = document.createElement('h3');
  const p = document.createElement('p');
  li.classList.add('list-group-item');
  h3.textContent = feedTitle;
  p.textContent = feedDescription;
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
    postLinkElement.classList.remove('fw-bold');
    postLinkElement.classList.add('fw-normal');
  });

  return button;
};

const isLinkOpened = (postId, openedPosts) => !!openedPosts.find((item) => postId === item.id);

const createLink = (postId, postTitle, postLink, openedPosts) => {
  const a = document.createElement('a');
  a.setAttribute('href', postLink);
  a.setAttribute('target', 'blank');
  a.textContent = postTitle;
  if (isLinkOpened(postId, openedPosts)) {
    a.classList.add('font-weight-normal');
  } else {
    a.classList.add('font-weight-bold');
  }
  return a;
};

const renderPosts = (state) => {
  const container = document.querySelector('.posts');
  container.innerHTML = '';

  const h2 = document.createElement('h2');
  h2.textContent = 'Посты';

  const ul = document.createElement('ul');
  ul.classList.add('list-group');
  const { openedPosts } = state.uiState;
  state.posts.forEach((post) => {
    const {
      postId, postTitle, postDescription, postLink,
    } = post;

    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

    const a = createLink(postId, postTitle, postLink, openedPosts);
    const button = createButton(postId, postTitle, postDescription, postLink, openedPosts);
    li.append(a, button);
    ul.prepend(li);
  });
  container.append(h2, ul);
};

export {
  renderError,
  renderFeed,
  renderPosts,
  renderHeaderAfterLoad,
};
