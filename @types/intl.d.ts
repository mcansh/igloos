declare namespace Intl {
  class ListFormat {
    public constructor(
      locales?: string | string[] | undefined,
      options: {
        // @default 'best fit
        localeMatcher?: 'lookup' | 'best fit';
        type: 'conjunction' | 'disjunction' | 'unit';
        style?: 'long' | 'short' | 'narrow';
      }
    );
    public format: (items: Array<string>) => string;
  }
}
