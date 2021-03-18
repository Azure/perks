import { ExistsUri, ReadUri } from "./data-acquisition";
import { CreateFileUri } from "./uri-manipulation";

describe("Uri data acquisition", () => {
  it("ExistsUri", async () => {
    expect(await ExistsUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/README.md")).toBe(true);
    expect(await ExistsUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/READMEx.md")).toBe(
      false,
    );
    expect(await ExistsUri(CreateFileUri(__filename))).toEqual(true);
    expect(await ExistsUri(CreateFileUri(__filename + "_"))).toEqual(false);
  });

  it("ReadUri", async () => {
    expect(
      (await ReadUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/README.md")).length > 0,
    ).toBeTruthy();
    expect((await ReadUri(CreateFileUri(__filename))).length > 0).toBeTruthy();
  });
});
