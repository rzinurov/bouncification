import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from "unique-names-generator";

export default {
  randomName: () =>
    uniqueNamesGenerator({
      dictionaries: [adjectives, animals],
      length: 2,
    }),
};
