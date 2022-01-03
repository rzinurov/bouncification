import { uniqueNamesGenerator, animals, colors } from "unique-names-generator";

export default {
  randomName: () =>
    uniqueNamesGenerator({
      dictionaries: [colors, animals],
      length: 2,
    }),
};
