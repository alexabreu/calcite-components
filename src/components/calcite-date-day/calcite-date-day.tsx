import {
  Component,
  Element,
  Prop,
  Host,
  Event,
  EventEmitter,
  Listen,
  h
} from "@stencil/core";
import { SPACE, ENTER } from "../../utils/keys";

@Component({
  tag: "calcite-date-day",
  styleUrl: "calcite-date-day.scss",
  shadow: true
})
export class CalciteDateDay {
  //--------------------------------------------------------------------------
  //
  //  Element
  //
  //--------------------------------------------------------------------------

  @Element() el: HTMLElement;

  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  /**
   * day of the month to be shown.
   */
  @Prop() day: number = 0;
  /**
   * Enables tells whether day enabled for the user click.
   */
  @Prop() enable: boolean = true;
  /**
   * Selected tells whether day is selected.
   */
  @Prop() selected: boolean = false;
  /**
   * Active tells whether day is Actively in focus.
   */
  @Prop() active: boolean = false;

  //--------------------------------------------------------------------------
  //
  //  Events
  //
  //--------------------------------------------------------------------------
  
  /**
   * When user selects day it emits the event.
   */
  @Event() calciteDaySelect: EventEmitter;

  //--------------------------------------------------------------------------
  //
  //  Lifecycle
  //
  //--------------------------------------------------------------------------

  componentWillUpdate(): void {}

  render() {
    return (
      <Host class={`${this.enable ? "enabled" : "disabled"} day ${
        this.selected ? "selected-day" : ""
      } ${this.active ? "active": ""}`}
      role="gridcell"
      tabindex={this.selected || this.active ? 0 : -1}>
          {this.day}
      </Host>
    );
  }

  //--------------------------------------------------------------------------
  //
  //  Event Listeners
  //
  //--------------------------------------------------------------------------

  @Listen("click") onClick() {
    this.enable 
    && (this.selected = true) 
    && this.calciteDaySelect.emit();
    
  }

  @Listen("keydown") keyDownHandler(e: KeyboardEvent) {
    if (e.keyCode === SPACE || e.keyCode === ENTER) {
      this.enable 
      && (this.selected = true) 
      && this.calciteDaySelect.emit();
    }
  }
}
