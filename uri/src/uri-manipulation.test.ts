import {
  CreateFileUri,
  CreateFolderUri,
  ParentFolderUri,
  ResolveUri,
  simplifyUri,
  ToRawDataUrl,
} from "./uri-manipulation";

describe("Uri Manipulation", () => {
  it("CreateFileUri", async () => {
    expect(CreateFileUri("C:\\windows\\path\\file.txt")).toEqual("file:///C:/windows/path/file.txt");
    expect(CreateFileUri("/linux/path/file.txt")).toEqual("file:///linux/path/file.txt");
    expect(() => CreateFileUri("relpath\\file.txt")).toThrow();
    expect(() => CreateFileUri("relpath/file.txt")).toThrow();
  });

  it("CreateFolderUri", async () => {
    expect(CreateFolderUri("C:\\windows\\path\\")).toEqual("file:///C:/windows/path/");
    expect(CreateFolderUri("/linux/path/")).toEqual("file:///linux/path/");
    expect(() => CreateFolderUri("relpath\\")).toThrow();
    expect(() => CreateFolderUri("relpath/")).toThrow();
    expect(() => CreateFolderUri("relpath")).toThrow();
    expect(() => CreateFolderUri("relpath")).toThrow();
  });

  it("ParentFolderUri", async () => {
    expect(ParentFolderUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/README.md")).toEqual(
      "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/",
    );
    expect(ParentFolderUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/")).toEqual(
      "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/",
    );
    expect(ParentFolderUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/")).toEqual(
      "https://raw.githubusercontent.com/Azure/",
    );
    expect(ParentFolderUri("https://raw.githubusercontent.com/Azure/")).toEqual("https://raw.githubusercontent.com/");
    expect(ParentFolderUri("https://raw.githubusercontent.com/")).toEqual("https://");
    expect(ParentFolderUri("https://")).toEqual(null);
  });

  it("ResolveUri", async () => {
    expect(ResolveUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/", "README.md")).toEqual(
      "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/README.md",
    );
    expect(ResolveUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/", "../README.md")).toEqual(
      "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/README.md",
    );
    expect(ResolveUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master", "README.md")).toEqual(
      "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/README.md",
    );
    expect(
      ResolveUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master", "file:///README.md"),
    ).toEqual("file:///README.md");
    expect(ResolveUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master", "/README.md")).toEqual(
      "file:///README.md",
    );
    expect(ResolveUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master", "C:\\README.md")).toEqual(
      "file:///C:/README.md",
    );
    // multi-slash collapsing
    expect(
      ResolveUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/", "folder///file.md"),
    ).toEqual("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/folder/file.md");
    // token forwarding
    expect(
      ResolveUri(
        "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/file1.json?token=asd%3Dnot_really_a_token123%3D",
        "./file2.json",
      ),
    ).toEqual(
      "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/file2.json?token=asd%3Dnot_really_a_token123%3D",
    );
    expect(
      ResolveUri(
        "https://myprivatepage.com/file1.json?token=asd%3Dnot_really_a_token123%3D",
        "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/file2.json",
      ),
    ).toEqual("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/file2.json");
    expect(
      ResolveUri(
        "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/file1.json?token=asd%3Dnot_really_a_token123%3D",
        "https://evil.com/file2.json",
      ),
    ).toEqual("https://evil.com/file2.json");
    expect(ResolveUri("https://somewhere.com/file1.json?token=asd%3Dnot_really_a_token123%3D", "./file2.json")).toEqual(
      "https://somewhere.com/file2.json",
    );
  });

  it("ToRawDataUrl", async () => {
    // GitHub blob
    expect(ToRawDataUrl("https://github.com/Microsoft/vscode/blob/master/.gitignore")).toEqual(
      "https://raw.githubusercontent.com/Microsoft/vscode/master/.gitignore",
    );
    expect(ToRawDataUrl("https://github.com/Microsoft/TypeScript/blob/master/README.md")).toEqual(
      "https://raw.githubusercontent.com/Microsoft/TypeScript/master/README.md",
    );
    expect(
      ToRawDataUrl("https://github.com/Microsoft/TypeScript/blob/master/tests/cases/compiler/APISample_watcher.ts"),
    ).toEqual(
      "https://raw.githubusercontent.com/Microsoft/TypeScript/master/tests/cases/compiler/APISample_watcher.ts",
    );
    expect(
      ToRawDataUrl(
        "https://github.com/Azure/azure-rest-api-specs/blob/master/arm-web/2015-08-01/AppServiceCertificateOrders.json",
      ),
    ).toEqual(
      "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/arm-web/2015-08-01/AppServiceCertificateOrders.json",
    );

    // unknown / already raw
    expect(
      ToRawDataUrl(
        "https://raw.githubusercontent.com/Microsoft/TypeScript/master/tests/cases/compiler/APISample_watcher.ts",
      ),
    ).toEqual(
      "https://raw.githubusercontent.com/Microsoft/TypeScript/master/tests/cases/compiler/APISample_watcher.ts",
    );
    expect(
      ToRawDataUrl(
        "https://assets.onestore.ms/cdnfiles/external/uhf/long/9a49a7e9d8e881327e81b9eb43dabc01de70a9bb/images/microsoft-gray.png",
      ),
    ).toEqual(
      "https://assets.onestore.ms/cdnfiles/external/uhf/long/9a49a7e9d8e881327e81b9eb43dabc01de70a9bb/images/microsoft-gray.png",
    );
    expect(ToRawDataUrl("README.md")).toEqual("README.md");
    expect(ToRawDataUrl("compiler/APISample_watcher.ts")).toEqual("compiler/APISample_watcher.ts");
    expect(ToRawDataUrl("compiler\\APISample_watcher.ts")).toEqual("compiler/APISample_watcher.ts");
    expect(ToRawDataUrl("C:\\arm-web\\2015-08-01\\AppServiceCertificateOrders.json")).toEqual(
      "c:/arm-web/2015-08-01/AppServiceCertificateOrders.json",
    );
  });

  fdescribe("simplifyUri", () => {
    it("use null:// protocol if none provided", () => {
      expect(simplifyUri("readme.md")).toEqual("null://readme.md");
    });

    it("simplify an uri with ..", () => {
      expect(simplifyUri("https://github.com/foo/bar/some/path/../../readme.md")).toEqual(
        "https://github.com/foo/bar/readme.md",
      );
    });

    it("simplify an uri duplicate forward slash", () => {
      expect(simplifyUri("https://github.com/foo/bar//some/path/../../readme.md")).toEqual(
        "https://github.com/foo/bar//readme.md",
      );
    });
  });
});
