// In-memory fallback database for assessment permissions if migrations haven't run locally
const localPermissionsStore = new Map();

module.exports = { localPermissionsStore };
