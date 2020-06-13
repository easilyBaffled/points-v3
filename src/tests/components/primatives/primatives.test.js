import React from "react";
import { setDebugLevel, resetDebugLevel } from "../../../util";
import { TaskId, TagId, TaskValue } from "../../../components/primatives";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";

console.tap = (v, ...args) => (console.log(v, ...args), v);
console.tap.label = (l, ...args) => (v) => (console.log(l, v, ...args), v);
console.tap.apply = (func, ...args) => (v) => (
  console.log(func(v), ...args), v
);

describe("TaskId", () => {
  test("should render at debug level 1", () => {
    setDebugLevel(1);
    const { getByText } = render(<TaskId>task-1</TaskId>);
    getByText("task-1");
  });

  test("should not render at debug level lower than 1", () => {
    resetDebugLevel();
    const { queryByText } = render(<TaskId>task-1</TaskId>);
    const actual = queryByText("task-1");
    const expected = null;
    expect(actual).toEqual(expected);
  });

  test("should raise an issue if not rendering a task id", () => {
    const actual = () => render(<TaskId>tag-1</TaskId>);
    const expected = '"tag-1" is not a Task Id';

    expect(actual).toThrow(expected);
  });

  test("on click it should log the task metadata", () => {
    const cl = console.log;
    let output = "";
    console.log = (...args) => (output = args.join("\n"));
    setDebugLevel(1);
    const { getByText } = render(
      <TaskId task={{ id: "task-1" }}>task-1</TaskId>
    );
    fireEvent.click(getByText("task-1"));
    const expected = { id: "task-1" };

    expect(output).toEqual(expected);
    console.log = cl;
  });
});

describe("TagId", () => {
  test("should render at debug level 1", () => {
    setDebugLevel(1);
    const { getByText } = render(<TagId>tag-1</TagId>);
    getByText("tag-1");
  });

  test("should not render at debug level lower than 1", () => {
    resetDebugLevel();
    const { queryByText } = render(<TagId>tag-1</TagId>);
    const actual = queryByText("tag-1");
    const expected = null;
    expect(actual).toEqual(expected);
  });

  test("should raise an issue if not rendering a tag id", () => {
    const actual = () => render(<TagId>task-1</TagId>);
    const expected = '"task-1" is not a Tag Id';
    console.log(actual, expected);
    expect(actual).toThrow(expected);
  });

  test("on click it should log the tag metadata", () => {
    const cl = console.log;
    let output = "";
    console.log = (...args) => (output = args.join("\n"));
    setDebugLevel(1);
    const { getByText } = render(<TagId tag={{ id: "tag-1" }}>tag-1</TagId>);
    fireEvent.click(getByText("tag-1"));
    const expected = { id: "tag-1" };

    expect(output).toEqual(expected);
    console.log = cl;
  });
});

describe("TaskValue", () => {
  test("should render a number", () => {
    const { getByText } = render(<TaskValue>1</TaskValue>);
    getByText("1");
  });
  test("should render a link when passed a taskId", () => {
    const { getByText } = render(<TaskValue>task-1</TaskValue>);
    getByText("1");
  });
});
