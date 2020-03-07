import { LitElement, html, customElement, property, TemplateResult, CSSResult, css } from 'lit-element';
import { HomeAssistant, fireEvent, LovelaceCardEditor, ActionConfig } from 'custom-card-helpers';

import { TimerCardConfig } from './types';

const options = {
  required: {
    icon: 'tune',
    name: 'Required',
    secondary: 'Required options for this card to function',
    show: true,
  }
};

@customElement('timer-card-editor')
export class TimerCardEditor extends LitElement implements LovelaceCardEditor {
  @property() public hass?: HomeAssistant;
  @property() private _config?: TimerCardConfig;
  @property() private _toggle?: boolean;

  public setConfig(config: TimerCardConfig): void {
    this._config = config;
  }

  get _name(): string {
    if (this._config) {
      return this._config.name || '';
    }

    return '';
  }

  get _inputDatetimeEntity(): string {
    if (this._config) {
      return this._config.inputDatetimeEntity || '';
    }

    return '';
  }

  get _inputBooleanEntity(): string {
    if (this._config) {
      return this._config.inputBooleanEntity || '';
    }

    return '';
  }

  protected render(): TemplateResult | void {
    if (!this.hass) {
      return html``;
    }

    // You can restrict on domain type
    const inputDatetimeEntities = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'input_datetime');
    const inputBooleanEntities = Object.keys(this.hass.states).filter(eid => eid.substr(0, eid.indexOf('.')) === 'input_boolean');

    return html`
      <div class="card-config">
        <div class="values">
          <paper-dropdown-menu
            label="Input Datetime Entity (Required)"
            @value-changed=${this._valueChanged}
            .configValue=${'inputDatetimeEntity'}
          >
            <paper-listbox slot="dropdown-content" .selected=${inputDatetimeEntities.indexOf(this._inputDatetimeEntity)}>
              ${inputDatetimeEntities.map(entity => {
                return html`
                  <paper-item>${entity}</paper-item>
                `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>
          <br />
          <paper-dropdown-menu
            label="Input Boolean Entity (Required)"
            @value-changed=${this._valueChanged}
            .configValue=${'inputBooleanEntity'}
          >
            <paper-listbox slot="dropdown-content" .selected=${inputBooleanEntities.indexOf(this._inputBooleanEntity)}>
              ${inputBooleanEntities.map(entity => {
                return html`
                  <paper-item>${entity}</paper-item>
                `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>
          <br />
          <paper-input label="Name (Required)" value=${this._name} @value-changed=${this._valueChanged} .configValue=${'name'}></<paper-input>
        </div>
      </div>
    `;
  }

  private _toggleOption(ev): void {
    this._toggleThing(ev, options);
  }

  private _toggleThing(ev, optionList): void {
    const show = !optionList[ev.target.option].show;
    for (const [key] of Object.entries(optionList)) {
      optionList[key].show = false;
    }
    optionList[ev.target.option].show = show;
    this._toggle = !this._toggle;
  }

  private _valueChanged(ev): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target;
    if (this[`_${target.configValue}`] === target.value) {
      return;
    }
    if (target.configValue) {
      if (target.value === '') {
        delete this._config[target.configValue];
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
    }
    fireEvent(this, 'config-changed', { config: this._config });
  }

  static get styles(): CSSResult {
    return css`
      .option {
        padding: 4px 0px;
        cursor: pointer;
      }
      .row {
        display: flex;
        margin-bottom: -14px;
        pointer-events: none;
      }
      .title {
        padding-left: 16px;
        margin-top: -6px;
        pointer-events: none;
      }
      .secondary {
        padding-left: 40px;
        color: var(--secondary-text-color);
        pointer-events: none;
      }
      .values {
        padding-left: 16px;
        background: var(--secondary-background-color);
      }
      ha-switch {
        padding-bottom: 8px;
      }
    `;
  }
}
