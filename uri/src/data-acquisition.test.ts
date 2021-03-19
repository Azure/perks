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
});
