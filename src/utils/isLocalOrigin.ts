export default function isLocalOrigin(origin?: string) {
  console.log(origin);
  if (!origin) return false;
  // Check if the origin matches a local address pattern (e.g., http://localhost:xxxx or http://192.168.x.x:xxxx)
  const localAddressPattern = /^(http?:\/\/)?(localhost|192\.168\.\d+\.\d+)(:\d+)?\/?$/;
  return localAddressPattern.test(origin);
}
