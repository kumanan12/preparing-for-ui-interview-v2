import { Component } from "../abstract-component/component";
import css from './calculator.module.css';

export class Calculator extends Component<{}> {

    toHTML() {
        return `
            <div class="${css.calculator}">
                <div class="${css.display}">0</div>
                <div class="${css.keypad}">
                    <!-- Buttons -->
                </div>
            </div>
        `;
    }
}
