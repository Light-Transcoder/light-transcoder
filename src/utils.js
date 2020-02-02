export const getNbChunks = (duration = 0, chunkDuration = 1) => (Math.ceil(duration / chunkDuration));

export const intCast = (v) => (parseInt(v, 10));

export const chunkCast = (v, padding = 0) => (v === 'initial' ? 'initial' : (intCast(v) + intCast(padding)));
