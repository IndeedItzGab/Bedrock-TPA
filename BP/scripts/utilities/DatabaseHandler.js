import { world, } from "@minecraft/server"

const CHUNK_SIZE = 3800;

// STORE - Responsible for storing values in the database
export function store(objective, value) {
  const json = JSON.stringify(value);
  const chunks = [];

  for (let i = 0; i < json.length; i += CHUNK_SIZE) {
    chunks.push(json.substring(i, i + CHUNK_SIZE));
  }

  // This avoid exceeding the character limit of the dynamic property
  chunks.forEach((chunk, index) => {
    world.setDynamicProperty(`${objective}_${index}`, chunk);
  });

  let index = chunks.length;
  while (world.getDynamicProperty(`${objective}_${index}`)) {
    world.setDynamicProperty(`${objective}_${index}`, undefined);
    index++;
  }

  world.setDynamicProperty(`${objective}_count`, chunks.length);
}

// FETCH - Responsible for retrieving property value on a specified id
export function fetch(objective, asArray = false) {
  const chunkCount = world.getDynamicProperty(`${objective}_count`);
  if (!chunkCount || typeof chunkCount !== "number") return asArray ? [] : null;

  let data = "";

  for (let i = 0; i < chunkCount; i++) {
    const part = world.getDynamicProperty(`${objective}_${i}`);
    if (typeof part !== "string") return asArray ? [] : null;
    data += part;
  }

  try {
    const parsed = JSON.parse(data);
    if (asArray) return Array.isArray(parsed) ? parsed : [];
    return parsed;
  } catch {
    return asArray ? [] : null;
  }
}

// FIND - Responsible for finding all 
export function find(prefix) {
  const allKeys = world.getDynamicPropertyIds();
  const baseKeys = new Set();

  for (const key of allKeys) {
    if (key.startsWith(prefix)) {
      const match = key.match(/^(.*?)(?:_(\d+|count))$/);

      if (match) {
        baseKeys.add(match[1]);
      } else {
        baseKeys.add(key);
      }
    }
  }

  return [...baseKeys];
}