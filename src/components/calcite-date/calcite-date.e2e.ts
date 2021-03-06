import { newE2EPage } from "@stencil/core/testing";
import { renders, defaults, hidden } from "../../tests/commonTests";
import { TEXT } from "./calcite-date-resources";

describe("calcite-date", () => {
  it("renders", async () => renders("calcite-date"));

  it("honors hidden attribute", async () => hidden("calcite-date"));

  it("has property defaults", async () =>
    defaults("calcite-date", [
      {
        propertyName: "intlPrevMonth",
        defaultValue: TEXT.prevMonth
      },
      {
        propertyName: "intlNextMonth",
        defaultValue: TEXT.nextMonth
      },
      {
        propertyName: "active",
        defaultValue: false
      },
      {
        propertyName: "noCalendarInput",
        defaultValue: false
      },
      {
        propertyName: "scale",
        defaultValue: "m"
      }
    ]));

  it("fires a calciteDateChange event on change", async () => {
    const page = await newE2EPage();
    await page.setContent("<calcite-date></calcite-date>");
    const input = (
      await page.waitForFunction(() =>
        document.querySelector("calcite-date").shadowRoot.querySelector("calcite-input input")
      )
    ).asElement();
    await input.focus();
    const changedEvent = await page.spyOnEvent("calciteDateChange");
    // have to wait for transition
    await new Promise((res) => setTimeout(() => res(true), 200));
    const wrapper = (
      await page.waitForFunction(() =>
        document.querySelector("calcite-date").shadowRoot.querySelector(".calendar-picker-wrapper")
      )
    ).asElement();
    expect(await wrapper.isIntersectingViewport()).toBe(true);

    await input.press("3");
    await input.press("/");
    await input.press("7");
    await input.press("/");
    await input.press("2");
    expect(changedEvent).toHaveReceivedEventTimes(1);
    await input.press("0");
    expect(changedEvent).toHaveReceivedEventTimes(2);
    await input.press("2");
    expect(changedEvent).toHaveReceivedEventTimes(3);
    await input.press("0");
    expect(changedEvent).toHaveReceivedEventTimes(4);
  });

  it("fires a calciteDateChange event when changing year in header", async () => {
    const page = await newE2EPage();
    await page.setContent("<calcite-date value='2000-11-27' no-calendar-input active></calcite-date>");
    const date = await page.find("calcite-date");
    const changedEvent = await page.spyOnEvent("calciteDateChange");
    // have to wait for transition
    await new Promise((res) => setTimeout(() => res(true), 200));
    // can't find this input as it's deeply nested in shadow dom, so just tab to it
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    await page.keyboard.press("ArrowUp");
    expect(changedEvent).toHaveReceivedEventTimes(1);
    const value = await date.getProperty("value");
    expect(value).toEqual("2001-11-27");
    await page.keyboard.press("ArrowDown");
    const value2 = await date.getProperty("value");
    expect(value2).toEqual("2000-11-27");
    expect(changedEvent).toHaveReceivedEventTimes(2);
  });

  it("doesn't fire calciteDateChange on outside changes to value", async () => {
    const page = await newE2EPage();
    await page.setContent("<calcite-date value='2000-11-27'></calcite-date>");
    const date = await page.find("calcite-date");
    const changedEvent = await page.spyOnEvent("calciteDateChange");
    await date.setProperty("value", "2001-10-28");
    expect(changedEvent).toHaveReceivedEventTimes(0);
  });
});
