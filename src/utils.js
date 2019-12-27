export const getTimeString = (time = 0) => (`PT${Math.floor(time / 3600)}H${Math.floor(time / 60)}M${Math.round(time % 60)}S`);

export const getNbChunks = (duration = 0, chunkDuration = 1) => (Math.ceil(duration / chunkDuration));

export const intCast = (v) => (parseInt(v, 10));

export const chunkCast =(v) => (v === 'initial' ? 'initial' : intCast(v));
