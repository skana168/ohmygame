interface ApplicationIdentity {
  readonly name: string;
  readonly packageName: string;
  readonly desktopId: string;
  readonly dataDirectory: string;
}
declare const identity: {
  loadIdentity(root?: string): ApplicationIdentity;
  dataDirectory(
    identity: ApplicationIdentity,
    root: string,
    environment?: Record<string, string | undefined>,
    desktopUserData?: string,
  ): string;
};
export = identity;
