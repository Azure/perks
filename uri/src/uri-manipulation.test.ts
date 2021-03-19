import {
  createFileUri,
  createFolderUri,
  parentFolderUri,
  resolveUri,
  simplifyUri,
  toRawDataUrl,
} from "./uri-manipulation";

describe("Uri Manipulation", () => {
  it("CreateFileUri", async () => {
    expect(createFileUri("C:\\windows\\path\\file.txt")).toEqual("file:///C:/windows/path/file.txt");
    expect(createFileUri("/linux/path/file.txt")).toEqual("file:///linux/path/file.txt");
    expect(() => createFileUri("relpath\\file.txt")).toThrow();
    expect(() => createFileUri("relpath/file.txt")).toThrow();
  });

  it("CreateFolderUri", async () => {
    expect(createFolderUri("C:\\windows\\path\\")).toEqual("file:///C:/windows/path/");
    expect(createFolderUri("/linux/path/")).toEqual("file:///linux/path/");
    expect(() => createFolderUri("relpath\\")).toThrow();
    expect(() => createFolderUri("relpath/")).toThrow();
    expect(() => createFolderUri("relpath")).toThrow();
    expect(() => createFolderUri("relpath")).toThrow();
  });

  it("ParentFolderUri", async () => {
    expect(parentFolderUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/README.md")).toEqual(
      "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/",
    );
    expect(parentFolderUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/")).toEqual(
      "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/",
    );
    expect(parentFolderUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/")).toEqual(
      "https://raw.githubusercontent.com/Azure/",
    );
    expect(parentFolderUri("https://raw.githubusercontent.com/Azure/")).toEqual("https://raw.githubusercontent.com/");
    expect(parentFolderUri("https://raw.githubusercontent.com/")).toEqual("https://");
    expect(parentFolderUri("https://")).toEqual(null);
  });

  it("ResolveUri", async () => {
    expect(resolveUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/", "README.md")).toEqual(
      "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/README.md",
    );
    expect(resolveUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/", "../README.md")).toEqual(
      "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/README.md",
    );
    expect(resolveUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master", "README.md")).toEqual(
      "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/README.md",
    );
    expect(
      resolveUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master", "file:///README.md"),
    ).toEqual("file:///README.md");
    expect(resolveUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master", "/README.md")).toEqual(
      "file:///README.md",
    );
    expect(resolveUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master", "C:\\README.md")).toEqual(
      "file:///C:/README.md",
    );
    // multi-slash collapsing
    expect(
      resolveUri("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/", "folder///file.md"),
    ).toEqual("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/folder/file.md");
    // token forwarding
    expect(
      resolveUri(
        "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/file1.json?token=asd%3Dnot_really_a_token123%3D",
        "./file2.json",
      ),
    ).toEqual(
      "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/file2.json?token=asd%3Dnot_really_a_token123%3D",
    );
    expect(
      resolveUri(
        "https://myprivatepage.com/file1.json?token=asd%3Dnot_really_a_token123%3D",
        "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/file2.json",
      ),
    ).toEqual("https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/file2.json");
    expect(
      resolveUri(
        "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/file1.json?token=asd%3Dnot_really_a_token123%3D",
        "https://evil.com/file2.json",
      ),
    ).toEqual("https://evil.com/file2.json");
    expect(resolveUri("https://somewhere.com/file1.json?token=asd%3Dnot_really_a_token123%3D", "./file2.json")).toEqual(
      "https://somewhere.com/file2.json",
    );
  });

  it("ToRawDataUrl", async () => {
    // GitHub blob
    expect(toRawDataUrl("https://github.com/Microsoft/vscode/blob/master/.gitignore")).toEqual(
      "https://raw.githubusercontent.com/Microsoft/vscode/master/.gitignore",
    );
    expect(toRawDataUrl("https://github.com/Microsoft/TypeScript/blob/master/README.md")).toEqual(
      "https://raw.githubusercontent.com/Microsoft/TypeScript/master/README.md",
    );
    expect(
      toRawDataUrl("https://github.com/Microsoft/TypeScript/blob/master/tests/cases/compiler/APISample_watcher.ts"),
    ).toEqual(
      "https://raw.githubusercontent.com/Microsoft/TypeScript/master/tests/cases/compiler/APISample_watcher.ts",
    );
    expect(
      toRawDataUrl(
        "https://github.com/Azure/azure-rest-api-specs/blob/master/arm-web/2015-08-01/AppServiceCertificateOrders.json",
      ),
    ).toEqual(
      "https://raw.githubusercontent.com/Azure/azure-rest-api-specs/master/arm-web/2015-08-01/AppServiceCertificateOrders.json",
    );

    // unknown / already raw
    expect(
      toRawDataUrl(
        "https://raw.githubusercontent.com/Microsoft/TypeScript/master/tests/cases/compiler/APISample_watcher.ts",
      ),
    ).toEqual(
      "https://raw.githubusercontent.com/Microsoft/TypeScript/master/tests/cases/compiler/APISample_watcher.ts",
    );
    expect(
      toRawDataUrl(
        "https://assets.onestore.ms/cdnfiles/external/uhf/long/9a49a7e9d8e881327e81b9eb43dabc01de70a9bb/images/microsoft-gray.png",
      ),
    ).toEqual(
      "https://assets.onestore.ms/cdnfiles/external/uhf/long/9a49a7e9d8e881327e81b9eb43dabc01de70a9bb/images/microsoft-gray.png",
    );
    expect(toRawDataUrl("README.md")).toEqual("README.md");
    expect(toRawDataUrl("compiler/APISample_watcher.ts")).toEqual("compiler/APISample_watcher.ts");
    expect(toRawDataUrl("compiler\\APISample_watcher.ts")).toEqual("compiler/APISample_watcher.ts");
    expect(toRawDataUrl("C:\\arm-web\\2015-08-01\\AppServiceCertificateOrders.json")).toEqual(
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

    it("simplify a local url", () => {
      expect(simplifyUri("file:///foo/bar/some/path/../../readme.md")).toEqual("file:///foo/bar/readme.md");
    });

    it("simplify a local url with extra slash", () => {
      expect(simplifyUri("file:///foo/bar//some/path/../../readme.md")).toEqual("file:///foo/bar//readme.md");
    });
  });
});
