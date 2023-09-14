/** Convert string to base64 */
export function base64(str: string) {
  return Buffer.from(str).toString("base64");
}

/**Get the Basic Auth string */
export function getBasicAuth<
  TUsername extends string,
  TPassword extends string
>(username: TUsername, password: TPassword) {
  return `Basic ${base64(`${username}:${password}`)}` as const;
}
