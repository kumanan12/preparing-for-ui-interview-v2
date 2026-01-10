import { Component } from "../abstract-component/component";

export class Typeahead extends Component<{}> {
    toHTML() {
        return `<div>Typeahead Component</div>`;
    }
}
