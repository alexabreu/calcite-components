import {
  Component,
  Host,
  h,
  Element,
  Prop,
  VNode,
  Listen,
  Method,
  EventEmitter,
  Event
} from "@stencil/core";
import { focusElement, getElementDir } from "../../utils/dom";
import { Scale, Theme } from "../../interfaces/common";
import { CSS } from "./resources";
import { CSS_UTILITY } from "../../utils/resources";

type OptionOrGroup = HTMLCalciteOptionElement | HTMLCalciteOptionGroupElement;
type NativeOptionOrGroup = HTMLOptionElement | HTMLOptGroupElement;

function isOption(optionOrGroup: OptionOrGroup): optionOrGroup is HTMLCalciteOptionElement {
  return optionOrGroup.tagName === "CALCITE-OPTION";
}

function isOptionGroup(
  optionOrGroup: OptionOrGroup
): optionOrGroup is HTMLCalciteOptionGroupElement {
  return optionOrGroup.tagName === "CALCITE-OPTION-GROUP";
}

@Component({
  tag: "calcite-select",
  styleUrl: "calcite-select.scss",
  shadow: true
})
export class CalciteSelect {
  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  /**
   * When true, it prevents the option from being selected.
   */
  @Prop({
    reflect: true
  })
  disabled = false;

  /**
   * The component's label. This is required for accessibility purposes.
   *
   */
  @Prop()
  label!: string;

  /**
   * The component scale.
   */
  @Prop({
    reflect: true
  })
  scale: Scale = "m";

  /**
   * The component theme.
   */
  @Prop({
    reflect: true
  })
  theme: Theme = "light";

  /**
   * The component width.
   */
  @Prop({
    reflect: true
  })
  width: "auto" | "half" | "full" = "auto";

  //--------------------------------------------------------------------------
  //
  //  Variables
  //
  //--------------------------------------------------------------------------

  @Element()
  private el: HTMLCalciteSelectElement;

  private componentToNativeEl = new Map<OptionOrGroup, NativeOptionOrGroup>();

  private mutationObserver = new MutationObserver(() => this.populateInternalSelect());

  private selectEl: HTMLSelectElement;

  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------

  connectedCallback(): void {
    const { el } = this;

    this.mutationObserver.observe(el, {
      subtree: true,
      childList: true
    });
  }

  disconnectedCallback(): void {
    this.mutationObserver.disconnect();
  }

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  @Method()
  async setFocus(): Promise<void> {
    focusElement(this.selectEl);
  }

  //--------------------------------------------------------------------------
  //
  //  Events
  //
  //--------------------------------------------------------------------------

  /**
   * This event will fire whenever the selected option changes.
   */
  @Event()
  calciteSelectChange: EventEmitter<void>;

  private handleInternalSelectChange = (): void => {
    this.selectFromNativeOption(this.selectEl.selectedOptions[0]);
    this.calciteSelectChange.emit();
  };

  @Listen("calciteOptionChange")
  @Listen("calciteOptionGroupChange")
  protected handleOptionOrGroupChange(event: CustomEvent): void {
    event.stopPropagation();

    const optionOrGroup = event.target as OptionOrGroup;
    const nativeEl = this.componentToNativeEl.get(optionOrGroup);

    if (!nativeEl) {
      return;
    }

    this.updateNativeElements(optionOrGroup, nativeEl);

    if (isOption(optionOrGroup) && optionOrGroup.selected) {
      this.deselectAllExcept(optionOrGroup);
    }
  }

  //--------------------------------------------------------------------------
  //
  //  Private Methods
  //
  //--------------------------------------------------------------------------

  private updateNativeElements(
    optionOrGroup: OptionOrGroup,
    nativeOptionOrGroup: NativeOptionOrGroup
  ): void {
    nativeOptionOrGroup.disabled = optionOrGroup.disabled;
    nativeOptionOrGroup.label = optionOrGroup.label;

    if (isOption(optionOrGroup)) {
      const option = nativeOptionOrGroup as HTMLOptionElement;
      option.selected = optionOrGroup.selected;
      option.value = optionOrGroup.value;
    }
  }

  private populateInternalSelect = (): void => {
    const optionsAndGroups = Array.from(this.el.children as HTMLCollectionOf<OptionOrGroup>);

    this.removeFromInternalSelect(optionsAndGroups);

    optionsAndGroups.forEach((optionOrGroup) => {
      this.selectEl.append(this.toNativeElement(optionOrGroup));
    });
  };

  private removeFromInternalSelect(optionsAndGroups: OptionOrGroup[]): void {
    optionsAndGroups.forEach((optionOrGroup) => {
      this.componentToNativeEl.clear();
      this.componentToNativeEl.get(optionOrGroup)?.remove();
    });
  }

  private storeSelectRef = (node: HTMLSelectElement): void => {
    this.selectEl = node;
    this.populateInternalSelect();

    const selected = this.selectEl.selectedOptions[0];
    this.selectFromNativeOption(selected);
  };

  private selectFromNativeOption(nativeOption: HTMLOptionElement): void {
    if (!nativeOption) {
      return;
    }

    this.componentToNativeEl.forEach((nativeOptionOrGroup, optionOrGroup) => {
      if (isOption(optionOrGroup) && nativeOptionOrGroup === nativeOption) {
        optionOrGroup.selected = true;
        this.deselectAllExcept(optionOrGroup as HTMLCalciteOptionElement);
      }
    });
  }

  private toNativeElement(
    optionOrGroup: HTMLCalciteOptionElement | HTMLCalciteOptionGroupElement
  ): NativeOptionOrGroup {
    if (isOption(optionOrGroup)) {
      const option = document.createElement("option");

      option.disabled = optionOrGroup.disabled;
      option.label = optionOrGroup.label;
      option.selected = optionOrGroup.selected;
      option.value = optionOrGroup.value;

      this.componentToNativeEl.set(optionOrGroup, option);

      return option;
    }

    if (isOptionGroup(optionOrGroup)) {
      const group = document.createElement("optgroup");

      group.disabled = optionOrGroup.disabled;
      group.label = optionOrGroup.label;

      Array.from(optionOrGroup.children as HTMLCollectionOf<HTMLCalciteOptionElement>).forEach(
        (option) => {
          const nativeOption = this.toNativeElement(option);
          group.append(nativeOption);
          this.componentToNativeEl.set(optionOrGroup, nativeOption);
        }
      );

      this.componentToNativeEl.set(optionOrGroup, group);

      return group;
    }

    throw new Error("unsupported element child provided");
  }

  private deselectAllExcept(except: HTMLCalciteOptionElement): void {
    this.el.querySelectorAll<HTMLCalciteOptionElement>("calcite-option").forEach((option) => {
      if (option === except) {
        return;
      }

      option.selected = false;
    });
  }

  //--------------------------------------------------------------------------
  //
  //  Render Methods
  //
  //--------------------------------------------------------------------------

  renderChevron(): VNode {
    const rtl = getElementDir(this.el) === "rtl";

    return (
      <calcite-icon
        class={{ [CSS.icon]: true, [CSS_UTILITY.rtl]: rtl }}
        icon="chevron-down"
        scale="s"
      />
    );
  }

  render(): VNode {
    return (
      <Host>
        <select
          aria-label={this.label}
          disabled={this.disabled}
          onChange={this.handleInternalSelectChange}
          ref={this.storeSelectRef}
        >
          <slot />
        </select>
        {this.renderChevron()}
      </Host>
    );
  }
}
