import { world, system } from "@minecraft/server"

const CHUNK_SIZE = 3800;

export function store(objective, value) {
  const json = JSON.stringify(value);
  const chunks = [];
  system.run(() => {
    for (let i = 0; i < json.length; i += CHUNK_SIZE) {
      chunks.push(json.substring(i, i + CHUNK_SIZE));
    }
  
    // Store each chunk as a scoreboard objective's display name
    chunks.forEach((chunk, index) => {
      const id = `${objective}_${index}`;
      const existing = world.scoreboard.getObjective(id);
      if (existing) world.scoreboard.removeObjective(id);
      world.scoreboard.addObjective(id, chunk);
    });
  
    // Remove any leftover old chunks
    let index = chunks.length;
    while (world.scoreboard.getObjective(`${objective}_${index}`)) {
      world.scoreboard.removeObjective(`${objective}_${index}`);
      index++;
    }
  
    // Store count
    const countId = `${objective}_count`;
    const existingCount = world.scoreboard.getObjective(countId);
    if (existingCount) world.scoreboard.removeObjective(countId);
    world.scoreboard.addObjective(countId, `${chunks.length}`);
  })
}

export function fetch(objective, asArray = false) {
  const countObj = world.scoreboard.getObjective(`${objective}_count`);
  if (!countObj) return asArray ? [] : null;

  const count = parseInt(countObj.displayName);
  if (isNaN(count)) return asArray ? [] : null;

  let data = "";

  for (let i = 0; i < count; i++) {
    const partObj = world.scoreboard.getObjective(`${objective}_${i}`);
    if (!partObj) return asArray ? [] : null;
    data += partObj.displayName;
  }

  try {
    const parsed = JSON.parse(data);
    return asArray ? (Array.isArray(parsed) ? parsed : []) : parsed;
  } catch {
    return asArray ? [] : null;
  }
}

export function find(prefix) {
  const allObjectives = world.scoreboard.getObjectives();
  const baseKeys = new Set();

  for (const obj of allObjectives) {
    const id = obj.id;
    if (id.startsWith(prefix)) {
      const match = id.match(/^(.*?)(?:_(\d+|count))$/);
      if (match) {
        baseKeys.add(match[1]);
      } else {
        baseKeys.add(id);
      }
    }
  }

  return [...baseKeys];
}