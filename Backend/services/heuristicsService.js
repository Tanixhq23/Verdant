exports.applyHeuristics = async (resources) => {
  let totalRequests = resources.length;
  let uncompressedImages = resources.filter(r => r.url.match(/\.(png|jpg|jpeg)$/i)).length;
  let largeScripts = resources.filter(r => r.type === 'script' && r.size > 500000).length; // >500KB JS
  let externalDomains = [...new Set(resources.map(r => new URL(r.url).hostname))].length;

  return {
    totalRequests,
    uncompressedImages,
    largeScripts,
    externalDomains
  };
};