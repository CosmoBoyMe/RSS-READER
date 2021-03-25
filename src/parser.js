const parser = new DOMParser();
export default (stringContainingHTMLSource) => parser.parseFromString(stringContainingHTMLSource, 'application/xml');
