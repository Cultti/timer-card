import { LitElement, html, customElement, property, CSSResult, TemplateResult, css, PropertyValues } from 'lit-element';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  ActionHandlerEvent,
  handleAction,
  LovelaceCardEditor,
  getLovelace,
  fireEvent,
} from 'custom-card-helpers';

import './editor';

import { TimerCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';

import '@material/mwc-textfield';

import { localize } from './localize/localize';

@customElement('timer-card')
export class TimerCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('timer-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): object {
    return {};
  }

  // TODO Add any properities that should cause your element to re-render here
  @property() public hass?: HomeAssistant;
  @property() private _config?: TimerCardConfig;

  public setConfig(config: TimerCardConfig): void {
    // TODO Check for required fields and that they are of the proper format
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    this._config = {
      name: 'Timer',
      ...config,
    };
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    const oldHass = changedProps.get('hass') as HomeAssistant | undefined;
    if (oldHass) {
      return (
        oldHass.states[this._config!.inputBooleanEntity!] !== this.hass!.states[this._config!.inputBooleanEntity!] ||
        oldHass.states[this._config!.inputDatetimeEntity!] !== this.hass!.states[this._config!.inputDatetimeEntity!]
      );
    }
    return true;
  }

  private inputBooleanChangeHandler = () => {
    this.hass?.callService('input_boolean', 'toggle', {entity_id: this._config?.inputBooleanEntity});
  }

  private inputDatetimeChangeHandler = (evt : any) => {
    this.hass?.callService('input_datetime', 'set_datetime', {"entity_id":this._config?.inputDatetimeEntity,"time":evt.currentTarget.value});
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }
    
    const inputDatetimeState = this.hass.states[this._config.inputDatetimeEntity ?? '']
    const inputDatetime = inputDatetimeState.state.slice(0,5);
    const inputBooleanState = this.hass.states[this._config.inputBooleanEntity ?? '']
    const checked = 'checked';

    return html`
      <ha-card
        .header=${this._config.name}
        tabindex="0"}
      >
      <div class="lahtoaika">
        <mwc-textfield outlined label="Lähtöaika" type="time" value=${inputDatetime} @change=${this.inputDatetimeChangeHandler}></mwc-textfield>
        <mwc-switch ?checked=${inputBooleanState.state == 'on'} @change=${this.inputBooleanChangeHandler}></mwc-switch>
      </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      mwc-textfield {
        min-width: 100px;
        margin: 25px 25px 25px 25px;
      }
    `;
  }
}
