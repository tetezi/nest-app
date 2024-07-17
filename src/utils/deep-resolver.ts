// 递归地解析输入中的所有 Promise 对象
async function deepResolvePromises(input) {
  // 如果输入是 Promise 对象，则等待其解析
  if (input instanceof Promise) {
    return await input;
  }

  // 如果输入是数组，则递归解析数组中的每个元素
  if (Array.isArray(input)) {
    const resolvedArray = await Promise.all(input.map(deepResolvePromises));
    return resolvedArray;
  }

  // 如果输入是 Date 对象，则直接返回
  if (input instanceof Date) {
    return input;
  }

  // 如果输入是对象，则递归解析对象中的每个属性
  if (typeof input === 'object' && input !== null) {
    const keys = Object.keys(input);
    const resolvedObject = {};

    for (const key of keys) {
      const resolvedValue = await deepResolvePromises(input[key]);
      resolvedObject[key] = resolvedValue;
    }

    return resolvedObject;
  }

  // 如果输入是其他类型，则直接返回
  return input;
}

export default deepResolvePromises;
