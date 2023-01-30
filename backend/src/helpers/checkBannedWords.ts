import Filter from "bad-words";
import { bannedWords } from "@/helpers/bannedWords";

const placeHolder = "~";

type MatchItem = [startChar: number, endChar: number];

interface Result {
  isProfane: boolean;
  matches: MatchItem[];
}

export function checkBannedWords(string: string): Result {
  const filter = new Filter({
    placeHolder,
    list: bannedWords,
  });

  const replacedString = filter.clean(string);
  const reg = new RegExp(`${placeHolder}+`, "igm");
  const result = [...replacedString.matchAll(reg)];
  const matches = result.map((item) => {
    const index = item.index || 0;
    return [index, index + item[0].length - 1];
  }) as MatchItem[];

  return {
    isProfane: !!matches.length,
    matches,
  };
}

export function checkUrlExists(string: string): boolean {
  const expression =
    /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;
  var regex = new RegExp(expression);

  if (string.match(regex)) {
    return true;
  } else {
    return false;
  }
}
