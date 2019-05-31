import { Component, Element, h, Host, Prop } from "@stencil/core";

@Component({
  tag: "calcite-progress",
  styleUrl: "calcite-progress.scss",
  shadow: false
})
export class CalciteProgress {
  @Element() el: HTMLElement;

  @Prop() type: "indeterminate" | "determinate" = "determinate";

  @Prop() value = 0;

  @Prop() text: string = null;

  @Prop() reversed = false;

  render() {
    return (
      <Host
        class="calcite-progress"
        type={this.type}
        reversed={this.reversed}
        style={{
          "--percentage-value": `${this.value * 100}%`
        }}
      >
        <div class="calcite-progress__text">{this.text}</div>
        <slot />
      </Host>
    );
  }
}