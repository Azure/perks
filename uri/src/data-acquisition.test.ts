import { resolve } from "path";
import { existsUri, readUri } from "./data-acquisition";
import { createFileUri } from "./uri-manipulation";

describe("Uri data acquisition", () => {
  it("ExistsUri", async () => {
    expect(await existsUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/README.md")).toBe(true);
    expect(await existsUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/READMEx.md")).toBe(
      false,
    );
    expect(await existsUri(createFileUri(__filename))).toEqual(true);
    expect(await existsUri(createFileUri(__filename + "_"))).toEqual(false);
  });

  it("ReadUri", async () => {
    expect(
      (await readUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/README.md")).length > 0,
    ).toBeTruthy();
    expect((await readUri(createFileUri(__filename))).length > 0).toBeTruthy();
  });

  it.only("reads local file with # in name", async () => {
    const uri = createFileUri(resolve(__dirname, "fixtures/c#.json"));
    const content = await readUri(uri);
    expect(content).toEqual("Content of c#.txt");
  });
});
