export default (link, schema) => {
  try {
    schema().validateSync(link);
    return '';
  } catch (e) {
    return e.message;
  }
};
