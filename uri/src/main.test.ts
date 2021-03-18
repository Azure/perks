import * as assert from "assert";
import { EnumerateFiles, ExistsUri, ReadUri } from "./main";
import { CreateFileUri, CreateFolderUri } from "./uri-manipulation";

describe("Uri", () => {
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

  it("ExistsUri", async () => {
    assert.strictEqual(
      await ExistsUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/README.md"),
      true,
    );
    assert.strictEqual(
      await ExistsUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/READMEx.md"),
      false,
    );
    expect(await ExistsUri(CreateFileUri(__filename))).toEqual(true);
    expect(await ExistsUri(CreateFileUri(__filename + "_"))).toEqual(false);
  });

  it("ReadUri", async () => {
    assert.ok(
      (await ReadUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/README.md")).length > 0,
    );
    assert.ok((await ReadUri(CreateFileUri(__filename))).length > 0);
  });
});
