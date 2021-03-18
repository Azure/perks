import { EnumerateFiles } from "./os-abstractions";
import { CreateFileUri, CreateFolderUri } from "./uri-manipulation";

describe("Uri Os Abstractions", () => {
  it("EnumerateFiles local", async () => {
    let foundMyself = false;
    for (const file of await EnumerateFiles(CreateFolderUri(__dirname))) {
      if (file === CreateFileUri(__filename)) {
        foundMyself = true;
      }
    }
    expect(foundMyself).toEqual(true);
  });

  it("EnumerateFiles remote", async () => {
    const files = await EnumerateFiles("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/", [
      "README.md",
    ]);
    expect(files).not.toHaveLength(0);
  });
});
