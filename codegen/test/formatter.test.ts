import { Style } from "../formatter";

describe("Formatter", () => {
  describe("Snake case", () => {
    it("convert camel case words", () => {
      expect(Style.snake("fooBar")).toEqual("foo_bar");
    });

    it("convert word with spaces", () => {
      expect(Style.snake("foo bar")).toEqual("foo_bar");
    });

    it("convert word with numbers", () => {
      expect(Style.snake("foo123bar")).toEqual("foo123_bar");
    });

    it("convert words with upper cased words", () => {
      expect(Style.snake("someSQLConnection")).toEqual("some_sql_connection");
    });

    it("it doesn't split upper case words with less than 2 characters", () => {
      expect(Style.snake("diskMBpsReadWrite")).toEqual("disk_mbps_read_write");
      expect(Style.snake("instanceIDs")).toEqual("instance_ids");
    });
  });
});
