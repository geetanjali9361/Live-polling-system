function tallyCounts(question, qMap) {
  const opts = Array.isArray(question?.options) ? question.options : [];
  return opts.map((_, i) => {
    let c = 0;
    for (const v of qMap.values()) if (v === i) c++;
    return c;
  });
}
module.exports = { tallyCounts };
