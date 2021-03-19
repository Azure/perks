import { enumerateFiles } from "./os-abstractions";
import { createFileUri, createFolderUri } from "./uri-manipulation";

describe("Uri Os Abstractions", () => {
  it("EnumerateFiles local", async () => {
    let foundMyself = false;
    for (const file of await enumerateFiles(createFolderUri(__dirname))) {
      if (file === createFileUri(__filename)) {
        foundMyself = true;
      }
    }
    expect(foundMyself).toEqual(true);
  });

  it("EnumerateFiles remote", async () => {
    const files = await enumerateFiles("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/", [
      "README.md",
    ]);
    expect(files).not.toHaveLength(0);
  });
});
