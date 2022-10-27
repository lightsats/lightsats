declare module "lnurl" {
  function encode(x: string): string;
  function decode(x: string): string;
  function verifyAuthorizationSignature(
    sig: string,
    k1: string,
    key: string
  ): boolean;
}
