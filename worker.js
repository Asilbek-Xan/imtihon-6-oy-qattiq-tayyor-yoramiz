function filterByType(data, key) {
  const unique = [...new Set(data.map((item) => item[key]).filter(Boolean))];
  return unique;
}

function search(data, keyword) {
  if (!keyword || !keyword.trim()) return data;
  const q = String(keyword).toLowerCase();
  return data.filter((item) => {
    const fields = [
      item.name,
      item.description,
      item.color,
      item.category,
      item.country,
      String(item.price),
      String(item.year),
      String(item.max_speed),
    ];
    return fields.some((f) => (f || "").toLowerCase().includes(q));
  });
}

const actions = { filterByType, search };

onmessage = (evt) => {
  const func = evt.data.functionName;
  const params = evt.data.params;
  const result = actions[func](...params);
  postMessage({ target: func, result });
};



